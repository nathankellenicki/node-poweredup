const debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Hub = require("./hub.js"),
    Port = require("./port.js"),
    Consts = require("./consts.js");


class BoostHub extends Hub {


    constructor (peripheral) {
        super(peripheral);
        this.type = Consts.Hubs.BOOST_MOVE_HUB;
        this.ports = {
            "A": new Port("A", 55),
            "B": new Port("B", 56),
            "C": new Port("C", 1),
            "D": new Port("D", 2)
        };
        this._lastTiltX = 0;
        this._lastTiltY = 0;
        debug("Discovered Boost Move Hub");
    }


    static isBoostHub (peripheral) {
        return (peripheral.advertisement.localName === Consts.BLE.Name.BOOST_MOVE_HUB_NAME && peripheral.advertisement.serviceUuids.indexOf(Consts.BLE.Services.BOOST_MOVE_HUB) >= 0);
    }


    connect (callback) {
        debug("Connecting to Boost Move Hub");
        super.connect(() => {
            this._subscribeToCharacteristic(this._characteristics[Consts.BLE.Characteristics.Boost.ALL], this._parseMessage.bind(this));
            debug("Connect completed");
            if (callback) {
                callback();
            }
        })
    }


    setMotorSpeed (port, speed, seconds) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            const data = Buffer.from([0x0c, 0x00, 0x81, this.ports[port].value, 0x11, 0x09, 0xff, 0xff, speed, 0x64, 0x7f, 0x03]);
            if (seconds) {
                data.writeUInt16LE(seconds * 1000, 6);
            }
            characteristic.write(data);
        }
    }


    _parseMessage (data) {

        switch (data[2]) {
            case 0x04:
            {
                this._parsePortMessage(data);
                break;
            }
            case 0x45:
            {
                this._parseSensorMessage(data);
                break;
            }
        }
    }


    _parsePortMessage (data) {

        let port = null;

        if (data[4] !== 1) { // NK: This doesn't support groups...yet.
            return;
        }

        if (data[3] === 1) {
            port = this.ports["C"];
        } else if (data[3] === 2) {
            port = this.ports["D"];
        } else if (data[3] === 55) {
            port = this.ports["A"];
        } else if (data[3] === 56) {
            port = this.ports["B"];
        } else {
            return;
        }

        port.connected = data[4] === 1 ? true : false;
        
        if (port.connected) {
            switch (data[5]) {
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
                    this._activatePortDevice(port.value, port.type, 0x08, 0x00);
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
            }
        } else {
            port.type = null;
            debug(`Port ${port.id} disconnected`);
        }

    }


    _activatePortDevice (port, type, mode, format, callback) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            characteristic.write(Buffer.from([0x0a, 0x00, 0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), callback);
        }
    }


    _parseSensorMessage (data) {
        
        let port = null;

        if (data[3] === 1) {
            port = this.ports["C"];
        } else if (data[3] === 2) {
            port = this.ports["D"];
        } else if (data[3] === 55) {
            port = this.ports["A"];
        } else if (data[3] === 56) {
            port = this.ports["B"];
        } else {
            return;
        }

        if (port && port.connected) {
            switch (port.type) {
                case Consts.Devices.WEDO2_DISTANCE:
                {
                    let distance = data[4];
                    if (data[5] === 1) {
                        distance = data[4] + 255;
                    }
                    this.emit("distance", port.id, distance * 10);
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {

                    this.emit("color", port.id, data[4]);

                    let distance;
                    if (data[7] > 0 && data[5] < 2) {
                        distance = Math.floor(20 - (data[7] * 2.85));
                    } else if (data[5] > 9) {
                        distance = 10;
                    } else {
                        distance = Math.floor((20 + (data[5] * 18)));
                    }

                    if (distance > 130) {
                        distance = 130;
                    }
                    
                    this.emit("distance", port.id, distance);
                    break;
                }
                case Consts.Devices.WEDO2_TILT:
                {
                    this._lastTiltX = data[4];
                    if (this._lastTiltX > 100) {
                        this._lastTiltX = -(255 - this._lastTiltX);
                    }
                    this._lastTiltY = data[5];
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


module.exports = BoostHub;