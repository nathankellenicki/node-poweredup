import { Peripheral } from "noble";

import { Hub } from "./hub.js";
import { Port } from "./port.js";

import * as Consts from "./consts";

import Debug = require("debug");
const debug = Debug("lpf2hub");


/**
 * The LPF2Hub is emitted if the discovered device is either a Boost Move Hub, Powered Up Hub, or Powered Up Remote.
 * @class LPF2Hub
 * @extends Hub
 */
export class LPF2Hub extends Hub {


    public static IsLPF2Hub (peripheral: Peripheral) {
        return (peripheral.advertisement.serviceUuids.indexOf(Consts.BLEServices.BOOST_MOVE_HUB) >= 0);
    }


    private _lastTiltX: number = 0;
    private _lastTiltY: number = 0;


    constructor (peripheral: Peripheral, autoSubscribe: boolean = true) {
        super(peripheral, autoSubscribe);
        switch (peripheral.advertisement.localName) {
            case Consts.BLENames.POWERED_UP_HUB_NAME:
            {
                this.type = Consts.Hubs.POWERED_UP_HUB;
                this._ports = {
                    "A": new Port("A", 55),
                    "B": new Port("B", 56),
                    "AB": new Port("AB", 57)
                };
                debug("Discovered Powered Up Hub");
                break;
            }
            case Consts.BLENames.POWERED_UP_REMOTE_NAME:
            {
                this.type = Consts.Hubs.POWERED_UP_REMOTE;
                debug("Discovered Powered Up Remote");
                break;
            }
            default:
            {
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
                break;
            }
        }
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Boost Move Hub");
            await super.connect();
            const characteristic = this._characteristics[Consts.BLECharacteristics.BOOST_ALL];
            this._subscribeToCharacteristic(characteristic, this._parseMessage.bind(this));
            characteristic.write(Buffer.from([0x05, 0x00, 0x01, 0x02, 0x02]), false);
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method LPF2Hub#setLEDColor
     * @param {number} color A number representing one of the LED color consts.
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            const characteristic = this._characteristics[Consts.BLECharacteristics.BOOST_ALL];
            if (characteristic) {
                let data = Buffer.from([0x05, 0x00, 0x01, 0x02, 0x02]);
                characteristic.write(data, false);
                if (color === false) {
                    color = 0;
                }
                data = Buffer.from([0x08, 0x00, 0x81, 0x32, 0x11, 0x51, 0x00, color]);
                characteristic.write(data, false);
            }
            return resolve();
        });
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
     * @method LPF2Hub#setMotorSpeed
     * @param {string} port
     * @param {number} speed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} [time] How long to activate the motor for (in milliseconds). Leave empty to turn the motor on indefinitely.
     * @returns {Promise} Resolved upon successful completion of command. If time is specified, this is once the motor is finished.
     */
    public setMotorSpeed (port: string, speed: number, time: number) {
        return new Promise((resolve, reject) => {
            const characteristic = this._characteristics[Consts.BLECharacteristics.BOOST_ALL];
            if (characteristic) {
                const portObj = this._ports[port];
                if (time) {
                    portObj.busy = true;
                    const data = Buffer.from([0x0c, 0x00, 0x81, portObj.value, 0x11, 0x09, 0x00, 0x00, this._mapSpeed(speed), 0x64, 0x7f, 0x03]);
                    data.writeUInt16LE(time > 65535 ? 65535 : time, 6);
                    characteristic.write(data, false);
                    portObj.finished = () => {
                        return resolve();
                    };
                } else {
                    const data = Buffer.from([0x0a, 0x00, 0x81, portObj.value, 0x11, 0x01, this._mapSpeed(speed), 0x64, 0x7f, 0x03]);
                    characteristic.write(data, false);
                    return resolve();
                }
            }
        });
    }


    /**
     * Rotate a motor by a given angle.
     * @method LPF2Hub#setMotorAngle
     * @param {string} port
     * @param {number} angle How much the motor should be rotated (in degrees).
     * @param {number} [speed=100] How fast the motor should be rotated.
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public setMotorAngle (port: string, angle: number, speed: number = 100) {
        return new Promise((resolve, reject) => {
            const characteristic = this._characteristics[Consts.BLECharacteristics.BOOST_ALL];
            if (characteristic) {
                const portObj = this._ports[port];
                portObj.busy = true;
                const data = Buffer.from([0x0e, 0x00, 0x81, portObj.value, 0x11, 0x0b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x64, 0x7f, 0x03]);
                data.writeUInt32LE(angle, 6);
                data.writeUInt8(this._mapSpeed(speed), 10);
                characteristic.write(data, false);
                portObj.finished = () => {
                    return resolve();
                };
            }
        });
    }


    protected _activatePortDevice (port: number, type: number, mode: number, format: number, callback: () => void) {
        const characteristic = this._characteristics[Consts.BLECharacteristics.BOOST_ALL];
        if (characteristic) {
            characteristic.write(Buffer.from([0x0a, 0x00, 0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), false, callback);
        }
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback: () => void) {
        const characteristic = this._characteristics[Consts.BLECharacteristics.BOOST_ALL];
        if (characteristic) {
            characteristic.write(Buffer.from([0x0a, 0x00, 0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x00]), false, callback);
        }
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
                break;
            }
        }
    }


    private _parseDeviceInfo (data: Buffer) {

        if (data[3] === 2) {
            if (data[5] === 1) {
                /**
                 * Emits when a button is pressed.
                 * @event LPF2Hub#button
                 * @param {string} button
                 * @param {number} state A number representing one of the button state consts.
                 */
                this.emit("button", "GREEN", Consts.ButtonStates.PRESSED);
                return;
            } else if (data[5] === 0) {
                this.emit("button", "GREEN", Consts.ButtonStates.RELEASED);
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

        if (data[4] === 0x0a) {
            port.busy = false;
            if (port.finished) {
                port.finished();
                port.finished = null;
            }
        }

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
                     * @event LPF2Hub#distance
                     * @param {string} port
                     * @param {number} distance Distance, in millimeters.
                     */
                    this.emit("distance", port.id, distance * 10);
                    break;
                }
                case Consts.Devices.BOOST_DISTANCE:
                {

                    /**
                     * Emits when a color sensor is activated.
                     * @event LPF2Hub#color
                     * @param {string} port
                     * @param {number} color A number representing one of the LED color consts.
                     */
                    if (data[4] <= 10) {
                        this.emit("color", port.id, data[4]);
                    }

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
                     * @event LPF2Hub#tilt
                     * @param {string} port If the event is fired from the Move Hub's in-built tilt sensor, the special port "TILT" is used.
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
                     * @event LPF2Hub#rotate
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
