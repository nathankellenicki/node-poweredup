import { Peripheral } from "noble";

import { LPF2Hub } from "./lpf2hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
const debug = Debug("boostmovehub");


/**
 * The BoostMoveHub is emitted if the discovered device is a Boost Move Hub.
 * @class BoostMoveHub
 * @extends LPF2Hub
 * @extends Hub
 */
export class BoostMoveHub extends LPF2Hub {


    public static IsBoostMoveHub (peripheral: Peripheral) {
        return (peripheral.advertisement.serviceUuids.indexOf(Consts.BLEServices.LPF2_HUB) >= 0 && peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.BOOST_MOVE_HUB_ID);
    }


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


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Boost Move Hub");
            await super.connect();
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method BoostMoveHub#setLEDColor
     * @param {number} color A number representing one of the LED color consts.
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            if (color === false) {
                color = 0;
            }
            const data = Buffer.from([0x08, 0x00, 0x81, 0x32, 0x11, 0x51, 0x00, color]);
            this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
            return resolve();
        });
    }


    /**
     * Set the motor speed on a given port.
     * @method BoostMoveHub#setMotorSpeed
     * @param {string} port
     * @param {number | Array<number>} speed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0. If you are specifying port AB to control both motors, you can optionally supply a tuple of speeds.
     * @param {number} [time] How long to activate the motor for (in milliseconds). Leave empty to turn the motor on indefinitely.
     * @returns {Promise} Resolved upon successful completion of command. If time is specified, this is once the motor is finished.
     */
    public setMotorSpeed (port: string, speed: number | [number, number], time?: number) {
        const portObj = this._portLookup(port);
        if (portObj.id !== "AB" && speed instanceof Array) {
            throw new Error(`Port ${portObj.id} can only accept a single speed`);
        }
        if (portObj.id === "AB") {
            const portObjA = this._portLookup("A");
            const portObjB = this._portLookup("B");
            if (portObjA.type !== portObjB.type) {
                throw new Error(`Port ${portObj.id} requires both motors be of the same type`);
            }
        }
        return new Promise((resolve, reject) => {
            if (time) {
                if (portObj.type === Consts.Devices.BOOST_INTERACTIVE_MOTOR || portObj.type === Consts.Devices.BOOST_MOVE_HUB_MOTOR) {
                    portObj.busy = true;
                    let data = null;
                    if (portObj.id === "AB") {
                        if (speed instanceof Array) {
                            data = Buffer.from([0x0d, 0x00, 0x81, portObj.value, 0x11, 0x0a, 0x00, 0x00, this._mapSpeed(speed[0]), this._mapSpeed(speed[1]), 0x64, 0x7f, 0x03]);
                        } else {
                            data = Buffer.from([0x0d, 0x00, 0x81, portObj.value, 0x11, 0x0a, 0x00, 0x00, this._mapSpeed(speed), this._mapSpeed(speed), 0x64, 0x7f, 0x03]);
                        }
                    } else {
                        // @ts-ignore: The type of speed is properly checked at the start
                        data = Buffer.from([0x0c, 0x00, 0x81, portObj.value, 0x11, 0x09, 0x00, 0x00, this._mapSpeed(speed), 0x64, 0x7f, 0x03]);
                    }
                    data.writeUInt16LE(time > 65535 ? 65535 : time, 6);
                    this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                    portObj.finished = () => {
                        return resolve();
                    };
                } else {
                    // @ts-ignore: The type of speed is properly checked at the start
                    const data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x51, 0x00, this._mapSpeed(speed)]);
                    this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                    setTimeout(() => {
                        const data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x51, 0x00, 0x00]);
                        this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                        return resolve();
                    }, time);
                }
            } else {
                // @ts-ignore: The type of speed is properly checked at the start
                const data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x51, 0x00, this._mapSpeed(speed)]);
                this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                return resolve();
            }
        });
    }


    /**
     * Rotate a motor by a given angle.
     * @method BoostMoveHub#setMotorAngle
     * @param {string} port
     * @param {number} angle How much the motor should be rotated (in degrees).
     * @param {number} [speed=100] How fast the motor should be rotated.
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public setMotorAngle (port: string, angle: number, speed: number = 100) {
        const portObj = this._portLookup(port);
        if (!(portObj.type === Consts.Devices.BOOST_INTERACTIVE_MOTOR || portObj.type === Consts.Devices.BOOST_MOVE_HUB_MOTOR)) {
            throw new Error("Angle rotation is only available when using a Boost Interactive Motor or Boost Move Hub Motor");
        }
        return new Promise((resolve, reject) => {
            portObj.busy = true;
            const data = Buffer.from([0x0e, 0x00, 0x81, portObj.value, 0x11, 0x0b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x64, 0x7f, 0x03]);
            data.writeUInt32LE(angle, 6);
            data.writeUInt8(this._mapSpeed(speed), 10);
            this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
            portObj.finished = () => {
                return resolve();
            };
        });
    }


}
