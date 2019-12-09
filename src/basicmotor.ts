import { Device } from "./device";
import { Hub } from "./hub";

import * as Consts from "./consts";

import { mapSpeed } from "./utils";

export class BasicMotor extends Device {


    constructor (hub: Hub, portId: number, type: number = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, type);
    }


    /**
     * Set the motor speed.
     * @method BasicMotor#power
     * @param {number} power For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public power (power: number) {
        return new Promise((resolve) => {
            const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, mapSpeed(power)]);
            this.send(data);
            return resolve();
        });
    }


    /**
     * Fully (hard) stop the motor.
     * @method BasicMotor#brake
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public brake () {
        return this.power(127);
    }


}
