import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MotionSensor
 * @extends Device
 */
export class MotionSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.MOTION_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.DISTANCE:
                let distance = message[this.isWeDo2SmartHub ? 2 : 4];
                if (message[this.isWeDo2SmartHub ? 3 : 5] === 1) {
                    distance = distance + 255;
                }
                distance *= 10;
                /**
                 * Emits when a distance sensor is activated.
                 * @event MotionSensor#distance
                 * @type {object}
                 * @param {number} distance Distance, in millimeters.
                 */
                this.notify("distance", { distance });
                break;
        }
    }

}

export enum Mode {
    DISTANCE = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "distance": Mode.DISTANCE
};
