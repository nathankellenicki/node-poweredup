import { Device } from "./device";

import { IDeviceInterface, IMode } from "../interfaces";

import * as Consts from "../consts";

import { calculateRamp, mapSpeed } from "../utils";

export const modes: IMode[] = [
    {
        name: "POWER", // or LPF2-MOTOR
        input: false,
        output: true,
        raw: { min: -100, max: 100 },
        pct: { min: -100, max: 100 },
        si: { min: -100, max: 100, symbol: "PCT" },
        values: { count: 1, type: Consts.ValueType.Int8 }
    }
];

/**
 * @class BasicMotor
 * @extends Device
 */
export class BasicMotor extends Device {


    constructor (hub: IDeviceInterface, portId: number, _modes: IMode[] = [], type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, _modes.length > 0 ? _modes : modes, type);
    }


    /**
     * Set the motor power.
     * @method BasicMotor#setPower
     * @param {number} power For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setPower (power: number, interrupt: boolean = true) {
        if (interrupt) {
            this.cancelEventTimer();
        }
        return this.writeDirect(0x00, Buffer.from([mapSpeed(power)]));
    }


    /**
     * Ramp the motor power.
     * @method BasicMotor#rampPower
     * @param {number} fromPower For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} toPower For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} time How long the ramp should last (in milliseconds).
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public rampPower (fromPower: number, toPower: number, time: number) {
        this.cancelEventTimer();
        return new Promise((resolve) => {
            calculateRamp(this, fromPower, toPower, time)
            .on("changePower", (power) => {
                this.setPower(power, false);
            })
            .on("finished", resolve);
        });
    }


    /**
     * Stop the motor.
     * @method BasicMotor#stop
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public stop () {
        this.cancelEventTimer();
        return this.setPower(0);
    }


    /**
     * Brake the motor.
     * @method BasicMotor#brake
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public brake () {
        this.cancelEventTimer();
        return this.setPower(Consts.BrakingStyle.BRAKE);
    }


}
