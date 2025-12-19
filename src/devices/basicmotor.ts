import { Device } from "./device.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

import { calculateRamp, mapSpeed } from "../utils.js";

/**
 * @class BasicMotor
 * @extends Device
 */
export class BasicMotor extends Device {


    constructor (hub: IDeviceInterface, portId: number, modeMap: {[event: string]: number}, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, modeMap, type);
    }


    /**
     * Set the motor power.
     * @param {number} power For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {boolean} [interrupt=false] If true, previous commands are discarded.
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public setPower (power: number, interrupt: boolean = false) {
        return this.writeDirect(0x00, Buffer.from([mapSpeed(power)]), interrupt);
    }


    /**
     * Ramp the motor power.
     * @param {number} fromPower For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} toPower For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} time How long the ramp should last (in milliseconds).
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public rampPower (fromPower: number, toPower: number, time: number) {
        const powerValues = calculateRamp(fromPower, toPower, time);
        powerValues.forEach(value => {
            this.setPower(value);
            this.addPortOutputSleep(Math.round(time/powerValues.length));
        });
        return this.setPower(toPower);
    }


    /**
     * Stop the motor. Previous commands that have not completed are discarded.
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public stop () {
        return this.setPower(0, true);
    }


    /**
     * Brake the motor. Previous commands that have not completed are discarded.
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public brake () {
        return this.setPower(Consts.BrakingStyle.BRAKE, true);
    }


}
