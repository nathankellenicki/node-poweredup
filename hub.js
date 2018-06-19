const debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Port = require("./port.js"),
    Consts = require("./consts.js");


class Hub extends EventEmitter {


    constructor (peripheral, autoSubscribe) {
        super();
        this.autoSubscribe = autoSubscribe || true;
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


    subscribe (port, mode = false) {
        if (!mode) {
            switch (this.ports[port].type) {
                case Consts.Devices.BASIC_MOTOR:
                    mode = 0x02;
                    break;
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                    mode = 0x02;
                    break;
                case Consts.Devices.BOOST_MOVE_HUB_MOTOR:
                    mode = 0x02;
                    break;
                case Consts.Devices.BOOST_DISTANCE:
                    mode = Consts.Hubs.WEDO2_SMART_HUB ? 0x00 : 0x08
                    break;
                case Consts.Devices.BOOST_TILT:
                    mode = 0x04;
                    break;
                default:
                    mode = 0x00;
                    break;
            }
        }
        this._activatePortDevice(this.ports[port].value, this.ports[port].type, mode, 0x00);
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
                    if (this.autoSubscribe) {
                        this._activatePortDevice(port.value, port.type, 0x00, 0x00);
                    }
                    break;
                }
                case Consts.Devices.WEDO2_DISTANCE:
                {
                    port.type = Consts.Devices.WEDO2_DISTANCE;
                    debug(`Port ${port.id} connected, detected WEDO2_DISTANCE`);
                    if (this.autoSubscribe) {
                        this._activatePortDevice(port.value, port.type, 0x00, 0x00);
                    }
                    break;
                }
                case Consts.Devices.BASIC_MOTOR:
                {
                    port.type = Consts.Devices.BASIC_MOTOR;
                    debug(`Port ${port.id} connected, detected BASIC_MOTOR`);
                    if (this.autoSubscribe) {
                        this._activatePortDevice(port.value, port.type, 0x02, 0x00);
                    }
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {
                    port.type = Consts.Devices.BOOST_DISTANCE;
                    debug(`Port ${port.id} connected, detected BOOST_DISTANCE`);
                    if (this.autoSubscribe) {
                        this._activatePortDevice(port.value, port.type, this.type == Consts.Hubs.WEDO2_SMART_HUB ? 0x00 : 0x08, 0x00); // NK: 0x00 for WeDo 2.0 Smart hub, 0x08 for Boost Move Hub
                    }
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    port.type = Consts.Devices.BOOST_INTERACTIVE_MOTOR;
                    debug(`Port ${port.id} connected, detected BOOST_INTERACTIVE_MOTOR`);
                    if (this.autoSubscribe) {
                        this._activatePortDevice(port.value, port.type, 0x02, 0x00);
                    }
                    break;
                }
                case Consts.Devices.BOOST_MOVE_HUB_MOTOR:
                {
                    port.type = Consts.Devices.BOOST_MOVE_HUB_MOTOR;
                    debug(`Port ${port.id} connected, detected BOOST_MOVE_HUB_MOTOR`);
                    if (this.autoSubscribe) {
                        this._activatePortDevice(port.value, port.type, 0x02, 0x00);
                    }
                    break;
                }
                case Consts.Devices.BOOST_TILT:
                {
                    port.type = Consts.Devices.BOOST_TILT;
                    debug(`Port ${port.id} connected, detected BOOST_TILT`);
                    if (this.autoSubscribe) {
                        this._activatePortDevice(port.value, port.type, 0x04, 0x00);
                    }
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