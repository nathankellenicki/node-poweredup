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

    
}


module.exports = Hub;