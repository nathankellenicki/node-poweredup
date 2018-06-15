const debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Port = require("./port.js"),
    Consts = require("./consts.js");


class Hub extends EventEmitter {


    constructor (peripheral) {
        super();
        this._peripheral = peripheral;
        this._characteristics = {};
        this._batteryLevel = 100;
        this._rssi = -100; // Initialize as -100 - no signal
        this._ports = {};
        this.type = Consts.Hubs.UNKNOWN;
        this.uuid = peripheral.uuid;
    }


    connect (callback) {

        const self = this;

        this._peripheral.connect((err) => {

            this._rssi = this._peripheral.rssi;

            let rssiUpdateInterval = setInterval(() => {
                this._peripheral.updateRssi((err, rssi) => {
                    if (!err) {
                        if (this._rssi != rssi) {
                            this._rssi = rssi;
                            debug(`RSSI change ${rssi}`)
                            self.emit("rssiChange", rssi);
                        }
                    }
                });
            }, 2000);

            self._peripheral.on("disconnect", () => {
               clearInterval(rssiUpdateInterval);
            });

            self._peripheral.discoverServices([], (err, services) => {

                if (err) {
                    this.emit("error", err);
                    return;
                }

                debug("Service/characteristic discovery started");

                const servicePromises = [];
                
                services.forEach((service) => {

                    servicePromises.push(new Promise((resolve, reject) => {

                        service.discoverCharacteristics([], (err, characteristics) => {
                            characteristics.forEach((characteristic) => {
                                this._characteristics[characteristic.uuid] = characteristic;
                            });
                            return resolve();
                        });

                    }));

                });

                Promise.all(servicePromises).then(() => {
                    debug("Service/characteristic discovery finished");
                    if (callback) {
                        callback();
                    }
                })                

            });

        });

    }


    _subscribeToCharacteristic (characteristic, callback) {
        characteristic.on("data", (data, isNotification) => {
            return callback(data);
        });
        characteristic.subscribe((err) => {
            if (err) {
                this.emit("error", err);
            }
        });
    }


    _registerDeviceAttachment (port, type) {
        
        if (port.connected) {
            switch (type) {
                case Consts.Devices.WEDO2_TILT:
                {
                    port.type = Consts.Devices.WEDO2_TILT;
                    debug(`Port ${port.id} connected, detected WEDO2_TILT`);
                    this._activatePortDevice(port.value, port.type, 0x00, 0x00);
                    break;
                }
                case Consts.Devices.WEDO2_DISTANCE:
                {
                    port.type = Consts.Devices.WEDO2_DISTANCE;
                    debug(`Port ${port.id} connected, detected WEDO2_DISTANCE`);
                    this._activatePortDevice(port.value, port.type, 0x00, 0x00);
                    break;
                }
                case Consts.Devices.WEDO2_MOTOR:
                {
                    port.type = Consts.Devices.WEDO2_MOTOR;
                    debug(`Port ${port.id} connected, detected WEDO2_MOTOR`);
                    this._activatePortDevice(port.value, port.type, 0x02, 0x00);
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {
                    port.type = Consts.Devices.BOOST_DISTANCE;
                    debug(`Port ${port.id} connected, detected BOOST_DISTANCE`);
                    this._activatePortDevice(port.value, port.type, this.type == Consts.Hubs.WEDO2_SMART_HUB ? 0x00 : 0x08, 0x00); // NK: 0x00 for WeDo 2.0 Smart hub, 0x08 for Boost Move Hub
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    port.type = Consts.Devices.BOOST_INTERACTIVE_MOTOR;
                    debug(`Port ${port.id} connected, detected BOOST_INTERACTIVE_MOTOR`);
                    this._activatePortDevice(port.value, port.type, 0x02, 0x00);
                    break;
                }
                case Consts.Devices.BOOST_MOVE_HUB_MOTOR:
                {
                    port.type = Consts.Devices.BOOST_MOVE_HUB_MOTOR;
                    debug(`Port ${port.id} connected, detected BOOST_MOVE_HUB_MOTOR`);
                    this._activatePortDevice(port.value, port.type, 0x02, 0x00);
                    break;
                }
                case Consts.Devices.BOOST_TILT:
                {
                    port.type = Consts.Devices.BOOST_TILT;
                    debug(`Port ${port.id} connected, detected BOOST_TILT`);
                    this._activatePortDevice(port.value, port.type, 0x04, 0x00);
                    break;
                }
            }
        } else {
            port.type = null;
            debug(`Port ${port.id} disconnected`);
        }

    }

    
}


module.exports = Hub;