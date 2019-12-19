import { Device } from "./device";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

import * as Consts from "../consts";

import { mapSpeed } from "../utils";

export class BasicMotor extends Device {


    constructor (hub: IDeviceInterface, portId: number, modes: {[name: string]: IDeviceMode}, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, modes, type);
    }


    /**
     * Set the motor speed.
     * @method BasicMotor#power
     * @param {number} power For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public setPower (power: number) {
        return this.sendLinearPowerCommand(mapSpeed(power));
    }


    /**
     * Fully (hard) stop the motor.
     * @method BasicMotor#brake
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public brake () {
        return this.setPower(127);
    }


}
