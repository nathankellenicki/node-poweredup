import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class TechnicMediumHubAccelerometerSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, TechnicMediumHubAccelerometerSensor.ModeMap, Consts.DeviceType.TECHNIC_MEDIUM_HUB_ACCELEROMETER);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case TechnicMediumHubAccelerometerSensor.Mode.ACCEL:
                /**
                 * Emits when accelerometer detects movement. Measured in mG.
                 * @event LPF2Hub#accel
                 * @param {string} port
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                const accelX = Math.round(message.readInt16LE(4) / 4.096);
                const accelY = Math.round(message.readInt16LE(6) / 4.096);
                const accelZ = Math.round(message.readInt16LE(8) / 4.096);
                this.emitGlobal("accel", accelX, accelY, accelZ);
                break;
        }
    }

}

export namespace TechnicMediumHubAccelerometerSensor {

    export enum Mode {
        ACCEL = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "accel": TechnicMediumHubAccelerometerSensor.Mode.ACCEL
    }
    
}