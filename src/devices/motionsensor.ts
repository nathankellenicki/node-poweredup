import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class MotionSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {
            "distance": MotionSensor.Mode.DISTANCE
        }, Consts.DeviceType.MOTION_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case MotionSensor.Mode.DISTANCE:
                let distance = message[this.isWeDo2SmartHub ? 2 : 4];
                if (message[this.isWeDo2SmartHub ? 3 : 5] === 1) {
                    distance = distance + 255;
                }
                /**
                 * Emits when a distance sensor is activated.
                 * @event MotionSensor#distance
                 * @param {number} distance Distance, in millimeters.
                 */
                this.emit("distance", distance * 10);
                break;
        }
    }

}

export namespace MotionSensor {
    export enum Mode {
        DISTANCE = 0x00
    }
}