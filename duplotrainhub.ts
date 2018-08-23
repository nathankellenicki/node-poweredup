import { Peripheral } from "noble";

import { LPF2Hub } from "./lpf2hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
const debug = Debug("duplotrainhub");


/**
 * The DuploTrainHub is emitted if the discovered device is a Duplo Train Hub.
 * @class DuploTrainHub
 * @extends LPF2Hub
 * @extends Hub
 */
export class DuploTrainHub extends LPF2Hub {


    // We set JSDoc to ignore these events as a Duplo Train Hub will never emit them.

    /**
     * @event DuploTrainHub#distance
     * @ignore
     */

    /**
     * @event DuploTrainHub#tilt
     * @ignore
     */

    /**
     * @event DuploTrainHub#rotate
     * @ignore
     */

    /**
     * @event DuploTrainHub#attach
     * @ignore
     */

    /**
     * @event DuploTrainHub#detach
     * @ignore
     */


    public static IsDuploTrainHub (peripheral: Peripheral) {
        return (peripheral.advertisement.serviceUuids.indexOf(Consts.BLEServices.LPF2_HUB) >= 0 && peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.DUPLO_TRAIN_HUB_ID);
    }


    constructor (peripheral: Peripheral, autoSubscribe: boolean = true) {
        super(peripheral, autoSubscribe);
        this.type = Consts.Hubs.DUPLO_TRAIN_HUB;
        this._ports = {
            "MOTOR": new Port("MOTOR", 0),
            "LIGHT": new Port("LIGHT", 1)
        };
        debug("Discovered Duplo Train Hub");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Duplo Train Hub");
            await super.connect();
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Set the motor speed on a given port.
     * @method DuploTrainHub#setMotorSpeed
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
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed instanceof Array ? speed[0] : speed), this._mapSpeed(speed instanceof Array ? speed[1] : speed)]);
                } else {
                    // @ts-ignore: The type of speed is properly checked at the start
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x60, 0x00, this._mapSpeed(speed), 0x00, 0x00]);
                }
                this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                setTimeout(() => {
                    let data = null;
                    if (portObj.id === "AB") {
                        data = Buffer.from([0x81, portObj.value, 0x11, 0x02, 0x00, 0x00]);
                    } else {
                        data = Buffer.from([0x81, portObj.value, 0x11, 0x60, 0x00, 0x00, 0x00, 0x00]);
                    }
                    this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                    return resolve();
                }, time);
            } else {
                let data = null;
                if (portObj.id === "AB") {
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x02, this._mapSpeed(speed instanceof Array ? speed[0] : speed), this._mapSpeed(speed instanceof Array ? speed[1] : speed)]);
                } else {
                    // @ts-ignore: The type of speed is properly checked at the start
                    data = Buffer.from([0x81, portObj.value, 0x11, 0x60, 0x00, this._mapSpeed(speed), 0x00, 0x00]);
                }
                this._writeMessage(Consts.BLECharacteristics.LPF2_ALL, data);
                return resolve();
            }
        });
    }


    /**
     * Ramp the motor speed on a given port.
     * @method DuploTrainHub#rampMotorSpeed
     * @param {string} port
     * @param {number} fromSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} toSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} time How long the ramp should last (in milliseconds).
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public rampMotorSpeed (port: string, fromSpeed: number, toSpeed: number, time: number) {
        return new Promise((resolve, reject) => {
            this._calculateRamp(fromSpeed, toSpeed, time)
            .on("changeSpeed", (speed) => {
                this.setMotorSpeed(port, speed);
            })
            .on("finished", resolve);
        });
    }


}
