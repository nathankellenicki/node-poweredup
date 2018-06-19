const debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Port = require("./port.js"),
    Consts = require("./consts.js");


class Hub extends EventEmitter {


    constructor (peripheral, autoSubscribe) {
        super();
        this.autoSubscribe = !!autoSubscribe;
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
            mode = this._getModeForDeviceType(this.ports[port].type);
        }
        this._activatePortDevice(this.ports[port].value, this.ports[port].type, mode, 0x00);
    }


    unsubscribe (port, mode = false) {
        if (!mode) {
            mode = this._getModeForDeviceType(this.ports[port].type);
        }
        this._deactivatePortDevice(this.ports[port].value, this.ports[port].type, mode, 0x00);
    }


    _getModeForDeviceType (type) {
        switch (type) {
            case Consts.Devices.BASIC_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_MOVE_HUB_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_DISTANCE:
                return (this.type == Consts.Hubs.WEDO2_SMART_HUB ? 0x00 : 0x08);
            case Consts.Devices.BOOST_TILT:
                return 0x04;
            default:
                return 0x00;
        }
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
            port.type = type;
            if (this.autoSubscribe) {
                this._activatePortDevice(port.value, type, this._getModeForDeviceType(type), 0x00);
            }
        } else {
            port.type = null;
            debug(`Port ${port.id} disconnected`);
        }

    }

    
}


module.exports = Hub;