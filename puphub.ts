import { Peripheral } from "noble";

import { LPF2Hub } from "./lpf2hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
const debug = Debug("puphub");


/**
 * The PUPHub is emitted if the discovered device is a Powered Up Hub.
 * @class PUPHub
 * @extends LPF2Hub
 * @extends Hub
 */
export class PUPHub extends LPF2Hub {


    // We set JSDoc to ignore these events as a Powered Up Remote will never emit them.

    /**
     * @event PUPHub#rotate
     * @ignore
     */


    public static IsPUPHub (peripheral: Peripheral) {
        return (peripheral.advertisement.serviceUuids.indexOf(Consts.BLEServices.LPF2_HUB) >= 0 && peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.POWERED_UP_HUB_ID);
    }


    constructor (peripheral: Peripheral, autoSubscribe: boolean = true) {
        super(peripheral, autoSubscribe);
        this.type = Consts.Hubs.POWERED_UP_HUB;
        this._ports = {
            "A": new Port("A", 0),
            "B": new Port("B", 1),
            "AB": new Port("AB", 57)
        };
        debug("Discovered Powered Up Hub");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Powered Up Hub");
            await super.connect();
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method PUPHub#setLEDColor
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
     * @method PUPHub#setMotorSpeed
     * @param {string} port
     * @param {number | Array.<number>} speed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0. If you are specifying port AB to control both motors, you can optionally supply a tuple of speeds.
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
                let data = null;
                if (portObj.id === "AB") {
                    if (speed instanceof Array) {
                        data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed[0]), this._mapSpeed(speed[1])]);
                    } else {
                        data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed), this._mapSpeed(speed)]);
                    }
                } else {
                    // @ts-ignore: The type of speed is properly checked at the start
                    data = Buffer.from([0x0a, 0x00, 0x81, portObj.value, 0x11, 0x60, 0x00, this._mapSpeed(speed), 0x00, 0x00]);
                }
                this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                setTimeout(() => {
                    let data = null;
                    if (portObj.id === "AB") {
                        data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x02, 0x00]);
                    } else {
                        data = Buffer.from([0x0a, 0x00, 0x81, portObj.value, 0x11, 0x60, 0x00, 0x00, 0x00, 0x00]);
                    }
                    this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                    return resolve();
                }, time);
            } else {
                let data = null;
                if (portObj.id === "AB") {
                    if (speed instanceof Array) {
                        data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed[0]), this._mapSpeed(speed[1])]);
                    } else {
                        data = Buffer.from([0x08, 0x00, 0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed), this._mapSpeed(speed)]);
                    }
                } else {
                    // @ts-ignore: The type of speed is properly checked at the start
                    data = Buffer.from([0x0a, 0x00, 0x81, portObj.value, 0x11, 0x60, 0x00, this._mapSpeed(speed), 0x00, 0x00]);
                }
                this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                return resolve();
            }
        });
    }


}
