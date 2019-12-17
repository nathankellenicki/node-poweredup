import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

import { mapSpeed } from "../utils";

export class BasicMotor extends Device {


    constructor (hub: IDeviceInterface, portId: number, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, type);
    }


    /**
     * Set the motor speed.
     * @method BasicMotor#power
     * @param {number} power For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public setPower (power: number) {
        return new Promise((resolve) => {
            const isWeDo2 = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);
            if (isWeDo2) {
                const data = Buffer.from([this.portId, 0x01, 0x02, mapSpeed(power)]);
                this.send(data, Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            } else {
                const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, mapSpeed(power)]);
                this.send(data);
            }
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
