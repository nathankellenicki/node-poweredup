import { Peripheral } from "noble";

import { Hub } from "./hub.js";
import { Port } from "./port.js";

import Debug = require("debug");
const debug = Debug("lpf2");
import { Consts } from "./consts.js";


/**
 * @class BoostHub
 * @extends Hub
 */
export class BoostHub extends Hub {


    public static IsBoostHub (peripheral: Peripheral) {
        return (peripheral.advertisement.localName === Consts.BLE.Name.BOOST_MOVE_HUB_NAME && peripheral.advertisement.serviceUuids.indexOf(Consts.BLE.Services.BOOST_MOVE_HUB) >= 0);
    }


    private _lastTiltX: number = 0;
    private _lastTiltY: number = 0;


    constructor (peripheral: Peripheral, autoSubscribe: boolean = true) {
        super(peripheral, autoSubscribe);
        this.type = Consts.Hubs.BOOST_MOVE_HUB;
        this._ports = {
            "A": new Port("A", 55),
            "B": new Port("B", 56),
            "AB": new Port("AB", 57),
            "TILT": new Port("TILT", 58),
            "C": new Port("C", 1),
            "D": new Port("D", 2)
        };
        debug("Discovered Boost Move Hub");
    }


    public connect (callback: () => void) {
        debug("Connecting to Boost Move Hub");
        super.connect(() => {
            const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
            this._subscribeToCharacteristic(characteristic, this._parseMessage.bind(this));
            characteristic.write(Buffer.from([0x05, 0x00, 0x01, 0x02, 0x02]));
            debug("Connect completed");
            if (callback) {
                callback();
            }
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method BoostHub#setLEDColor
     * @param {number} color - A number representing one of the LED color consts.
     */
    public setLEDColor (color: number | boolean) {
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


    /**
     * Set the motor speed on a given port.
     * @method BoostHub#setMotorSpeed
     * @param {string} port
     * @param {number} speed - For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} [time] - How long to activate the motor for (in milliseconds). Leave empty to turn the motor on indefinitely.
     */
    public setMotorSpeed (port: string, speed: number, time: number) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            if (time) {
                const data = Buffer.from([0x0c, 0x00, 0x81, this._ports[port].value, 0x11, 0x09, 0x00, 0x00, speed, 0x64, 0x7f, 0x03]);
                data.writeUInt16LE(time > 65535 ? 65535 : time, 6);
                characteristic.write(data);
            } else {
                const data = Buffer.from([0x0a, 0x00, 0x81, this._ports[port].value, 0x11, 0x01, speed, 0x64, 0x7f, 0x03]);
                characteristic.write(data);
            }
        }
    }


    /**
     * Rotate a motor by a given angle.
     * @method BoostHub#setMotorAngle
     * @param {string} port
     * @param {number} angle - How much the motor should be rotated (in degrees).
     * @param {number} [speed=100] - How fast the motor should be rotated.
     */
    public setMotorAngle (port: string, angle: number, speed: number = 100) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            const data = Buffer.from([0x0e, 0x00, 0x81, this._ports[port].value, 0x11, 0x0b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x64, 0x7f, 0x03]);
            data.writeUInt32LE(angle, 6);
            data.writeInt8(speed, 10);
            characteristic.write(data);
        }
    }


    protected _activatePortDevice (port: number, type: number, mode: number, format: number, callback: () => void) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            characteristic.write(Buffer.from([0x0a, 0x00, 0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), callback);
        }
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback: () => void) {
        const characteristic = this._characteristics[Consts.BLE.Characteristics.Boost.ALL];
        if (characteristic) {
            characteristic.write(Buffer.from([0x0a, 0x00, 0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x00]), callback);
        }
    }


    private _getPortForPortNumber (num: number) {

        let port = null;

        if (num === 1) {
            port = this._ports["C"];
        } else if (num === 2) {
            port = this._ports["D"];
        } else if (num === 55) {
            port = this._ports["A"];
        } else if (num === 56) {
            port = this._ports["B"];
        } else if (num === 57) {
            port = this._ports["AB"];
        } else if (num === 58) {
            port = this._ports["TILT"];
        } else {
            return false;
        }

        return port;

    }


    private _parseMessage (data: Buffer) {

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


    private _parseDeviceInfo (data: Buffer) {

        if (data[3] === 2) {
            if (data[5] === 1) {
                /**
                 * Emits when a button is pressed.
                 * @event BoostHub#button
                 * @param {number} state - A number representing one of the button state consts.
                 */
                this.emit("button", Consts.Button.PRESSED);
                return;
            } else if (data[5] === 0) {
                this.emit("button", Consts.Button.RELEASED);
                return;
            }
        }

    }


    private _parsePortMessage (data: Buffer) {

        const port = this._getPortForPortNumber(data[3]);

        if (!port) {
            return;
        }

        port.connected = (data[4] === 1 || data[4] === 2) ? true : false;
        this._registerDeviceAttachment(port, data[5]);

    }


    private _parsePortAction (data: Buffer) {

        const port = this._getPortForPortNumber(data[3]);

        if (!port) {
            return;
        }

        // NK: Handle callbacks when port finished here.

    }


    private _parseSensorMessage (data: Buffer) {

        const port = this._getPortForPortNumber(data[3]);

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
                    /**
                     * Emits when a distance sensor is activated.
                     * @event BoostHub#distance
                     * @param {string} port
                     * @param {number} distance - Distance, in millimeters.
                     */
                    this.emit("distance", port.id, distance * 10);
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {

                    /**
                     * Emits when a color sensor is activated.
                     * @event BoostHub#color
                     * @param {string} port
                     * @param {number} color - A number representing one of the LED color consts.
                     */
                    this.emit("color", port.id, data[4]);

                    let distance = data[5];
                    const partial = data[7];

                    if (partial > 0) {
                        distance += 1 / partial;
                    }

                    this.emit("distance", port.id, Math.floor(distance * 25.4) - 20);
                    break;
                }
                case Consts.Devices.WEDO2_TILT:
                {
                    const tiltX = data[4] > 160 ? data[4] - 255 : data[4] - (data[4] * 2);
                    const tiltY = data[5] > 160 ? 255 - data[5] : data[5] - (data[5] * 2);
                    this._lastTiltX = tiltX;
                    this._lastTiltY = tiltY;
                    /**
                     * Emits when a tilt sensor is activated.
                     * @event BoostHub#tilt
                     * @param {string} port
                     * @param {number} x
                     * @param {number} y
                     */
                    this.emit("tilt", port.id, this._lastTiltX, this._lastTiltY);
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    const rotation = data.readInt32LE(2);
                    /**
                     * Emits when a rotation sensor is activated.
                     * @event BoostHub#rotate
                     * @param {string} port
                     * @param {number} rotation
                     */
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.Devices.BOOST_TILT:
                {
                    const tiltX = data[4] > 160 ? data[4] - 255 : data[4];
                    const tiltY = data[5] > 160 ? 255 - data[5] : data[5] - (data[5] * 2);
                    this.emit("tilt", port.id, tiltX, tiltY);
                    break;
                }
            }
        }

    }


}
