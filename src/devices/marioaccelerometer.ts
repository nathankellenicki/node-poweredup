import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MarioAccelerometer
 * @extends Device
 */
export class MarioAccelerometer extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.MARIO_ACCELEROMETER);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.ACCEL:
                /**
                 * Emits when accelerometer detects movement. Measured in mG.
                 * @event MarioAccelerometer#accel
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                const x = message[4];
                const y = message[5];
                const z = message[6];
                this.notify("accel", { x, y, z });
                break;
            case Mode.GEST:
                /**
                 * Emits when a gesture is detected
                 * @event MarioAccelerometer#gest
                 * @type {object}
                 * @param {number} gesture
                 */
                const gesture = message[4];
                this.notify("gesture", { gesture });
                break;
        }
    }

}

export enum Mode {
    ACCEL = 0x00,
    GEST = 0x01,
}

export const ModeMap: {[event: string]: number} = {
    "accel": Mode.ACCEL,
    "gesture": Mode.GEST,
};
