import { Device, DeviceVersion } from "./device";

import { IDeviceInterface, IDeviceMode } from "../../interfaces";

import { mapSpeed } from "../../utils";

export class BasicMotor extends Device {


    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion, modes: {[name: string]: IDeviceMode}) {
        super(hub, portId, versions, modes);
    }


    /**
     * Set the motor speed.
     * @method BasicMotor#power
     * @param {number} power For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public setPower (power: number) {
        return new Promise((resolve) => {
            this.writeDirect(0x00, Buffer.from([mapSpeed(power)]));
            return resolve();
        });
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
