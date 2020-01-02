import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

export class MotionSensor extends Device {
    protected static _type = 35;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, MotionSensor.ModeMap);
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
                this.emitGlobal("distance", distance * 10);
                break;
        }
    }

}

export namespace MotionSensor {

    export enum Mode {
        DISTANCE = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "distance": MotionSensor.Mode.DISTANCE
    }

}