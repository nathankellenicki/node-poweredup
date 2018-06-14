const debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Hub = require("./hub.js"),
    Port = require("./port.js"),
    Consts = require("./consts.js");


class WeDo2Hub extends Hub {


    constructor (peripheral) {
        super(peripheral);
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
        const characteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.MOTOR_VALUE_WRITE];
        if (characteristic) {
            if (color === false) {
                color = 0;
            }
            const data = Buffer.from([0x06, 0x04, 0x01, color]);
            characteristic.write(data);
        }
    }


    setMotorSpeed (port, speed) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.MOTOR_VALUE_WRITE];
        if (characteristic) {
            characteristic.write(Buffer.from([this.ports[port].value, 0x01, 0x02, speed]));
        }
    }


    _parsePortMessage (data) {

        let port = null;

        if (data[0] === 1) {
            port = this.ports["A"];
        } else if (data[0] === 2) {
            port = this.ports["B"];
        } else {
            return;
        }

        port.connected = data[1] === 1 ? true : false;
        
        if (port.connected) {
            switch (data[3]) {
                case Consts.Devices.WEDO2_TILT:
                {
                    port.type = Consts.Devices.WEDO2_TILT;
                    debug(`Port ${port.id} connected, detected WEDO2_TILT`);
                    this._activatePortDevice(data[0], port.type, 0x00, 0x00);
                    break;
                }
                case Consts.Devices.WEDO2_DISTANCE:
                {
                    port.type = Consts.Devices.WEDO2_DISTANCE;
                    debug(`Port ${port.id} connected, detected WEDO2_DISTANCE`);
                    this._activatePortDevice(data[0], port.type, 0x00, 0x00);
                    break;
                }
                case Consts.Devices.WEDO2_MOTOR:
                {
                    port.type = Consts.Devices.WEDO2_MOTOR;
                    debug(`Port ${port.id} connected, detected WEDO2_MOTOR`);
                    this._activatePortDevice(data[0], port.type, 0x02, 0x00);
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {
                    port.type = Consts.Devices.BOOST_DISTANCE;
                    debug(`Port ${port.id} connected, detected BOOST_DISTANCE`);
                    this._activatePortDevice(data[0], port.type, 0x02, 0x00);
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    port.type = Consts.Devices.BOOST_INTERACTIVE_MOTOR;
                    debug(`Port ${port.id} connected, detected BOOST_INTERACTIVE_MOTOR`);
                    this._activatePortDevice(data[0], port.type, 0x02, 0x00);
                    break;
                }
                case Consts.Devices.BOOST_MOVE_HUB_MOTOR:
                {
                    port.type = Consts.Devices.BOOST_MOVE_HUB_MOTOR;
                    debug(`Port ${port.id} connected, detected BOOST_MOVE_HUB_MOTOR`);
                    this._activatePortDevice(data[0], port.type, 0x02, 0x00);
                    break;
                }
            }
        } else {
            port.type = null;
            debug(`Port ${port.id} disconnected`);
        }

    }


    _activatePortDevice (port, type, mode, format, callback) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.WeDo2.PORT_TYPE_WRITE];
        if (characteristic) {
            characteristic.write(Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x01]), callback);
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
        
        let port = null;

        if (data[1] === 1) {
            port = this.ports["A"];
        } else if (data[1] === 2) {
            port = this.ports["B"];
        } else {
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
                    this.emit("distance", port.id, distance);
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