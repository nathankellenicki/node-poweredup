import { Peripheral } from "noble";

import { LPF2Hub } from "./lpf2hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
import { IBLEDevice } from "./interfaces";
const debug = Debug("puphub");


/**
 * The PUPHub is emitted if the discovered device is a Powered UP Hub.
 * @class PUPHub
 * @extends LPF2Hub
 * @extends Hub
 */
export class PUPHub extends LPF2Hub {


    // We set JSDoc to ignore these events as a Powered UP Remote will never emit them.

    /**
     * @event PUPHub#rotate
     * @ignore
     */

    /**
     * @event PUPHub#speed
     * @ignore
     */


    public static IsPUPHub (peripheral: Peripheral) {
        return (peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 && peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.POWERED_UP_HUB_ID);
    }


    constructor (device: IBLEDevice, autoSubscribe: boolean = true) {
        super(device, autoSubscribe);
        this.type = Consts.HubType.POWERED_UP_HUB;
        this._ports = {
            "A": new Port("A", 0),
            "B": new Port("B", 1),
            "AB": new Port("AB", 57)
        };
        debug("Discovered Powered UP Hub");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Powered UP Hub");
            await super.connect();
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Set the motor speed on a given port.
     * @method PUPHub#setMotorSpeed
     * @param {string} port
     * @param {number | Array.<number>} speed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0. If you are specifying port AB to control both motors, you can optionally supply a tuple of speeds.
     * @param {number} [time] How long to activate the motor for (in milliseconds). Leave empty to turn the motor on indefinitely.
     * @returns {Promise} Resolved upon successful completion of command. If time is specified, this is once the motor is finished.
     */
    public setMotorSpeed (port: string, speed: number | [number, number], time?: number | boolean) {
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
        let cancelEventTimer = true;
        if (typeof time === "boolean") {
            if (time === true) {
                cancelEventTimer = false;
            }
            time = undefined;
        }
        if (cancelEventTimer) {
            portObj.cancelEventTimer();
        }
        return new Promise((resolve, reject) => {
            if (time && typeof time === "number") {
                let data = null;
                if (portObj.id === "AB") {
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed instanceof Array ? speed[0] : speed), this._mapSpeed(speed instanceof Array ? speed[1] : speed)]);
                } else {
                    // @ts-ignore: The type of speed is properly checked at the start
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x60, 0x00, this._mapSpeed(speed), 0x00, 0x00]);
                }
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
                const timeout = global.setTimeout(() => {
                    let data = null;
                    if (portObj.id === "AB") {
                        data = Buffer.from([0x81, portObj.value, 0x11, 0x02, 0x00, 0x00]);
                    } else {
                        data = Buffer.from([0x81, portObj.value, 0x11, 0x60, 0x00, 0x00, 0x00, 0x00]);
                    }
                    this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
                    return resolve();
                }, time);
                portObj.setEventTimer(timeout);
            } else {
                let data = null;
                if (portObj.id === "AB") {
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed instanceof Array ? speed[0] : speed), this._mapSpeed(speed instanceof Array ? speed[1] : speed)]);
                } else {
                    // @ts-ignore: The type of speed is properly checked at the start
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x60, 0x00, this._mapSpeed(speed), 0x00, 0x00]);
                }
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
                return resolve();
            }
        });
    }


    /**
     * Ramp the motor speed on a given port.
     * @method PUPHub#rampMotorSpeed
     * @param {string} port
     * @param {number} fromSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} toSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} time How long the ramp should last (in milliseconds).
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public rampMotorSpeed (port: string, fromSpeed: number, toSpeed: number, time: number) {
        const portObj = this._portLookup(port);
        portObj.cancelEventTimer();
        return new Promise((resolve, reject) => {
            this._calculateRamp(fromSpeed, toSpeed, time, portObj)
            .on("changeSpeed", (speed) => {
                this.setMotorSpeed(port, speed, true);
            })
            .on("finished", resolve);
        });
    }


    /**
     * Fully (hard) stop the motor on a given port.
     * @method PUPHub#brakeMotor
     * @param {string} port
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public brakeMotor (port: string) {
        return this.setMotorSpeed(port, 127);
    }


    /**
     * Set the light brightness on a given port.
     * @method PUPHub#setLightBrightness
     * @param {string} port
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @param {number} [time] How long to turn the light on (in milliseconds). Leave empty to turn the light on indefinitely.
     * @returns {Promise} Resolved upon successful completion of command. If time is specified, this is once the light is turned off.
     */
    public setLightBrightness (port: string, brightness: number, time?: number) {
        const portObj = this._portLookup(port);
        portObj.cancelEventTimer();
        return new Promise((resolve, reject) => {
            const data = Buffer.from([0x81, portObj.value, 0x11, 0x51, 0x00, brightness]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            if (time) {
                const timeout = global.setTimeout(() => {
                    const data = Buffer.from([0x81, portObj.value, 0x11, 0x51, 0x00, 0x00]);
                    this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
                    return resolve();
                }, time);
                portObj.setEventTimer(timeout);
            } else {
                return resolve();
            }
        });
    }


}
