const debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Hub = require("./hub.js"),
    Port = require("./port.js"),
    Consts = require("./consts.js");


class WeDo2Hub extends Hub {


    constructor (peripheral, autoSubscribe) {
        super(peripheral, autoSubscribe);
        this.type = Consts.Hubs.WEDO2_SMART_HUB;
        this.ports = {
            "A": new Port("A", 1),
            "B": new Port("B", 2)
        };
        this._lastTiltX = 0;
        this._lastTiltY = 0;
        debug("Discovered WeDo 2.0 Smart Hub");
    }


    static isWeDo2Hub (peripheral) {
        return (peripheral.advertisement.localName === Consts.BLE.Name.WEDO2_SMART_HUB_NAME && peripheral.advertisement.serviceUuids.indexOf(Consts.BLE.Services.WEDO2_SMART_HUB) >= 0);
    }


    connect (callback) {
        debug("Connecting to WeDo 2.0 Smart Hub");
        super.connect(() => {
            this._subscribeToCharacteristic(this._characteristics[Consts.BLE.Characteristics.WeDo2.PORT_TYPE], this._parsePortMessage.bind(this));
            this._subscribeToCharacteristic(this._characteristics[Consts.BLE.Characteristics.WeDo2.SENSOR_VALUE], this._parseSensorMessage.bind(this));
            this._subscribeToCharacteristic(this._characteristics[Consts.BLE.Characteristics.WeDo2.BUTTON], this._parseSensorMessage.bind(this));
            debug("Connect completed");
            if (callback) {
                callback();
            }
        })
    }

    
    setLEDColor (color) {
        const motorCharacteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.MOTOR_VALUE_WRITE];
        const portCharacteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.PORT_TYPE_WRITE];
        if (motorCharacteristic && portCharacteristic) {
            let data = Buffer.from([0x06, 0x17, 0x01, 0x01]);
            portCharacteristic.write(data);
            if (color === false) {
                color = 0;
            }
            data = Buffer.from([0x06, 0x04, 0x01, color]);
            motorCharacteristic.write(data);
        }
    }


    setLEDRGB (red, green, blue) {
        const motorCharacteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.MOTOR_VALUE_WRITE];
        const portCharacteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.PORT_TYPE_WRITE];
        if (motorCharacteristic && portCharacteristic) {
            let data1 = Buffer.from([0x01, 0x02, 0x06, 0x17, 0x01, 0x02]);
            portCharacteristic.write(data1);
            let data2 = Buffer.from([0x06, 0x04, 0x03, red, green, blue]);
            console.log(data2);
            motorCharacteristic.write(data2);
        }
    }


    setMotorSpeed (port, speed) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.MOTOR_VALUE_WRITE];
        if (characteristic) {
            characteristic.write(Buffer.from([this.ports[port].value, 0x01, 0x02, speed]));
        }
    }


    _getPortForPortNumber (num) {

        let port = null;

        if (num === 1) {
            port = this.ports["A"];
        } else if (num === 2) {
            port = this.ports["B"];
        } else {
            return;
        }

        return port;

    }


    _parsePortMessage (data) {

        let port = this._getPortForPortNumber(data[0]);

        if (!port) {
            return;
        }

        port.connected = data[1] === 1 ? true : false;
        this._registerDeviceAttachment(port, data[3]);

    }


    _activatePortDevice (port, type, mode, format, callback) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.PORT_TYPE_WRITE];
        if (characteristic) {
            characteristic.write(Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x01]), callback);
        }
    }


    _deactivatePortDevice (port, type, mode, format, callback) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.PORT_TYPE_WRITE];
        if (characteristic) {
            characteristic.write(Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x00]), callback);
        }
    }


    _parseSensorMessage (data) {


        if (data[0] === 1) {
            this.emit("button", Consts.Button.PRESSED);
            return;
        } else if (data[0] === 0) {
            this.emit("button", Consts.Button.RELEASED);
            return;
        }
        
        let port = this._getPortForPortNumber(data[1]);

        if (!port) {
            return;
        }

        if (port && port.connected) {
            switch (port.type) {
                case Consts.Devices.WEDO2_DISTANCE:
                {
                    let distance = data[2];
                    if (data[3] === 1) {
                        distance = data[2] + 255;
                    }
                    this.emit("distance", port.id, distance * 10);
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {
                    let distance = data[2];
                    this.emit("color", port.id, distance);
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
                    this.emit("tilt", port.id, this._lastTiltX, this._lastTiltY);
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    const rotation = data.readInt32LE(2);
                    this.emit("rotate", port.id, rotation);
                }
            }
        }

    }


}


module.exports = WeDo2Hub;