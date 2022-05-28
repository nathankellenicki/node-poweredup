import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

import { calculateRamp, mapSpeed } from "../utils";

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
     * @method BasicMotor#setPower
     * @param {number} power For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {boolean} interrupt If true, previous commands are discarded.
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public setPower (power: number, interrupt: boolean = false) {
        return this.writeDirect(0x00, Buffer.from([mapSpeed(power)]), interrupt);
    }


    /**
     * Ramp the motor power.
     * @method BasicMotor#rampPower
     * @param {number} fromPower For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} toPower For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} time How long the ramp should last (in milliseconds).
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public rampPower (fromPower: number, toPower: number, time: number) {
        return new Promise<Consts.CommandFeedback>((resolve) => {
            calculateRamp(this, fromPower, toPower, time)
            .on("changePower", (power) => {
                this.setPower(power, false);
            })
            .on("finished", () => {
                return resolve(Consts.CommandFeedback.FEEDBACK_DISABLED);
            })
        });
    }


    /**
     * Stop the motor. Previous commands that have not completed are discarded.
     * @method BasicMotor#stop
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public stop () {
        return this.setPower(0, true);
    }


    /**
     * Brake the motor. Previous commands that have not completed are discarded.
     * @method BasicMotor#brake
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public brake () {
        return this.setPower(Consts.BrakingStyle.BRAKE, true);
    }


}
