import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TiltSensor
 * @extends Device
 */
export class TiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.TILT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.TILT:
                const x = message.readInt8(this.isWeDo2SmartHub ? 2 : 4);
                const y = message.readInt8(this.isWeDo2SmartHub ? 3 : 5);
                /**
                 * Emits when a tilt sensor is activated.
                 * @event TiltSensor#tilt
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 */
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
