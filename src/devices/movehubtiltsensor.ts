import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MoveHubTiltSensor
 * @extends Device
 */
export class MoveHubTiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.MOVE_HUB_TILT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.TILT:
                /**
                 * Emits when a tilt sensor is activated.
                 * @event MoveHubTiltSensor#tilt
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 */
                const x = -message.readInt8(4);
                const y = message.readInt8(5);
                this.notify("tilt", { x, y });
                break;
        }
    }

}

export enum Mode {
    TILT = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "tilt": Mode.TILT
};
