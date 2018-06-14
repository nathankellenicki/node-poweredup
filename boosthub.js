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
            "AB": new Port("AB", 57),
            "TILT": new Port("TILT", 58),
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
            const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
            this._subscribeToCharacteristic(characteristic, this._parseMessage.bind(this));
            characteristic.write(Buffer.from([0x05, 0x00, 0x01, 0x02, 0x02]));
            debug("Connect completed");
            if (callback) {
                callback();
            }
        })
    }


    setLEDColor (color) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            let data = Buffer.from([0x05, 0x00, 0x01, 0x02, 0x02]);
            characteristic.write(data);
            if (color === false) {
                color = 0;
            }
            data = Buffer.from([0x08, 0x00, 0x81, 0x32, 0x11, 0x51, 0x00, color]);
            characteristic.write(data);
        }
    }


    // setLEDRGB (red, green, blue) {
    //     const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
    //     if (characteristic) {
    //         let data = Buffer.from([0x05, 0x00, 0x01, 0x02, 0x03]);
    //         characteristic.write(data);
    //         data = Buffer.from([0x0a, 0x00, 0x81, 0x32, 0x11, 0x51, 0x00, red, green, blue]);
    //         characteristic.write(data);
    //     }
    // }


    setMotorSpeed (port, speed, time) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            if (time) {
                const data = Buffer.from([0x0c, 0x00, 0x81, this.ports[port].value, 0x11, 0x09, 0x00, 0x00, speed, 0x64, 0x7f, 0x03]);
                data.writeUInt16LE(time > 65535 ? 65535 : time, 6);
                characteristic.write(data);
            } else {
                const data = Buffer.from([0x0a, 0x00, 0x81, this.ports[port].value, 0x11, 0x01, speed, 0x64, 0x7f, 0x03]);
                characteristic.write(data);
            }
        }
    }


    setMotorAngle (port, angle, speed = 100) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            const data = Buffer.from([0x0e, 0x00, 0x81, this.ports[port].value, 0x11, 0x0b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x64, 0x7f, 0x03]);;
            data.writeUInt32LE(angle, 6);
            data.writeInt8(speed, 10);
            characteristic.write(data);
        }
    }


    _getPortForPortNumber (num) {

        let port = null;

        if (num === 1) {
            port = this.ports["C"];
        } else if (num === 2) {
            port = this.ports["D"];
        } else if (num === 55) {
            port = this.ports["A"];
        } else if (num === 56) {
            port = this.ports["B"];
        } else if (num === 57) {
            port = this.ports["AB"];
        } else if (num === 58) {
            port = this.ports["TILT"];
        } else {
            return false;
        }

        return port;

    }


    _parseMessage (data) {

        switch (data[2]) {
            case 0x01:
            {
                this._parseDeviceInfo(data);
                break;
            }
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
            case 0x82:
            {
                this._parsePortAction(data);
            }
        }
    }


    _parseDeviceInfo (data) {
        
        if (data[3] === 2) {
            if (data[5] === 1) {
                this.emit("button", Consts.Button.PRESSED);
                return;
            } else if (data[5] === 0) {
                this.emit("button", Consts.Button.RELEASED);
                return;
            }
        }

    }


    _parsePortMessage (data) {

        let port = this._getPortForPortNumber(data[3]);

        if (!port) {
            return;
        }

        port.connected = (data[4] === 1 || data[4] === 2) ? true : false;
        
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


    _parsePortAction (data) {

        let port = this._getPortForPortNumber(data[3]);

        if (!port) {
            return;
        }

        // NK: Handle callbacks when port finished here.

    }


    _activatePortDevice (port, type, mode, format, callback) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            characteristic.write(Buffer.from([0x0a, 0x00, 0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), callback);
        }
    }


    _parseSensorMessage (data) {
        
        let port = this._getPortForPortNumber(data[3]);

        if (!port) {
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

                    let distance = data[5],
                        partial = data[7];

                    if (partial > 0) {
                        distance += 1 / partial;
                    }
                    
                    this.emit("distance", port.id, Math.floor(distance * 25.4) - 20);
                    break;
                }
                case Consts.Devices.WEDO2_TILT:
                {
                    let tiltX = data[4] > 160 ? data[4] - 255 : data[4] - (data[4] * 2);
                    let tiltY = data[5] > 160 ? 255 - data[5] : data[5] - (data[5] * 2);
                    this._lastTiltX = tiltX;
                    this._lastTiltY = tiltY;
                    this.emit("tilt", port.id, this._lastTiltX, this._lastTiltY);
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    const rotation = data.readInt32LE(2);
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.Devices.BOOST_TILT:
                {
                    let tiltX = data[4] > 160 ? data[4] - 255 : data[4];
                    let tiltY = data[5] > 160 ? 255 - data[5] : data[5] - (data[5] * 2);
                    this.emit("tilt", port.id, tiltX, tiltY);
                    break;
                }
            }
        }

    }


}


module.exports = BoostHub;