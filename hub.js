const debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Port = require("./port.js"),
    Consts = require("./consts.js");


class Hub extends EventEmitter {


    constructor (peripheral) {
        super();

        this.deviceType = "WeDo 2.0 Smart Hub";

        this._peripheral = peripheral;
        this._batteryLevel = 100;
        this._rssi = -100; // Initialize as -100 - no signal

        this._portTypeWriteCharacteristic = null;
        this._motorValueWriteCharacteristic = null;

        this._lastTiltX = 0;
        this._lastTiltY = 0;

        this.ports = [new Port(0), new Port(1)];

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
                                switch (characteristic.uuid) {
                                    case Consts.BLE.Characteristics.PORT_TYPE:
                                        self._subscribeToCharacteristic(characteristic, self._parsePortMessage.bind(self));
                                        break;
                                    case Consts.BLE.Characteristics.PORT_TYPE_WRITE:
                                        this._portTypeWriteCharacteristic = characteristic;
                                        break;
                                    case Consts.BLE.Characteristics.MOTOR_VALUE_WRITE:
                                        this._motorValueWriteCharacteristic = characteristic;
                                        break;
                                    case Consts.BLE.Characteristics.SENSOR_VALUE:
                                        this._subscribeToCharacteristic(characteristic, self._parseSensorMessage.bind(self));
                                        break;
                                }
                            });
                            return resolve();
                        });

                    }));

                });

                Promise.all(servicePromises).then(() => {
                    if (callback) {
                        callback();
                    }
                })                

            });

        });

    }


    setMotorSpeed (port, speed) {
        if (this._motorValueWriteCharacteristic) {
            let newSpeed = 0;
            if (speed > 1 && speed <= 100) {
				newSpeed = parseInt(this._speedMapping(speed, 1, 100, 15, 97));
			} else if (speed < -1 && speed >= -100) {
				newSpeed = parseInt(this._speedMapping(speed, -100, -1, 160, 245));
			} else {
				newSpeed = 0;
			}
            this._motorValueWriteCharacteristic.write(Buffer.from([port + 1, 0x01, 0x02, speed]));
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


    _parseSensorMessage (data) {

        console.log(data);
        
        const port = this.ports[data[1] - 1];

        if (port && port.connected) {
            switch (port.type) {
                case Consts.Devices.WEDO2_DISTANCE:
                {
                    let distance = data[2];
                    if (data[3] === 1) {
                        distance = data[2] + 255;
                    }
                    this.emit("distance", data[1] - 1, distance);
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {
                    let distance = data[2];
                    this.emit("distance", data[1] - 1, distance);
                    break;
                }
                case Consts.Devices.WEDO2_TILT:
                {
                    this._lastTiltX = data[2];
                    if (this._lastTiltX > 100) {
                        this._lastTiltX = -(255 - this._lastTiltX);
                    }
                    this._lastTiltY = data[3];
                    if (this._lastTiltY > 100) {
                        this._lastTiltY = -(255 - this._lastTiltY);
                    }
                    this.emit("tilt", port, this._lastTiltX, this._lastTiltX);
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    const rotation = data.readInt32LE(2);
                    console.log(rotation);
                    this.emit("rotate", port, rotation);
                }
            }
        }

    }


    _parsePortMessage (data) {
        
        if (data[0] === 1 || data[0] === 2) {
            const port = this.ports[data[0] - 1];
            port.connected = data[1] === 1 ? true : false;
            
            if (port.connected) {
                switch (data[3]) {
                    case Consts.Devices.WEDO2_TILT:
                    {
                        port.type = Consts.Devices.WEDO2_TILT;
                        debug(`Port ${data[0] - 1} connected, detected WEDO2_TILT`);
                        this._activatePortDevice(data[0], port.type, 0x00, 0x00);
                        break;
                    }
                    case Consts.Devices.WEDO2_DISTANCE:
                    {
                        port.type = Consts.Devices.WEDO2_DISTANCE;
                        debug(`Port ${data[0] - 1} connected, detected WEDO2_DISTANCE`);
                        this._activatePortDevice(data[0], port.type, 0x00, 0x00);
                        break;
                    }
                    case Consts.Devices.WEDO2_MOTOR:
                    {
                        port.type = Consts.Devices.WEDO2_MOTOR;
                        debug(`Port ${data[0] - 1} connected, detected WEDO2_MOTOR`);
                        this._activatePortDevice(data[0], port.type, 0x02, 0x00);
                        break;
                    }
                    case Consts.Devices.BOOST_DISTANCE:
                    {
                        port.type = Consts.Devices.BOOST_DISTANCE;
                        debug(`Port ${data[0] - 1} connected, detected BOOST_DISTANCE`);
                        this._activatePortDevice(data[0], port.type, 0x02, 0x00);
                        break;
                    }
                    case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                    {
                        port.type = Consts.Devices.BOOST_INTERACTIVE_MOTOR;
                        debug(`Port ${data[0] - 1} connected, detected BOOST_INTERACTIVE_MOTOR`);
                        this._activatePortDevice(data[0], port.type, 0x02, 0x00);
                        break;
                    }
                }
            } else {
                port.type = null;
                debug(`Port ${data[0]} disconnected`);
            }

        }

    }


    _speedMapping (speed, inMin, inMax, outMin, outMax) {
        if (speed > inMax) {
            speed = inMax;
        }
        if (speed < inMin) {
            speed = inMax;
        }
        return (speed - inMax) * (outMax - outMin) / (inMax - inMin) + outMin;
    }


    _activatePortDevice (port, type, mode, format, callback) {
        if (this._portTypeWriteCharacteristic) {
            this._portTypeWriteCharacteristic.write(Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x01]), callback);
        }
    }

    
}


module.exports = Hub;