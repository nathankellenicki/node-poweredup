import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class TiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {
            "tilt": TiltSensor.Mode.TILT
        }, Consts.DeviceType.TILT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case TiltSensor.Mode.TILT:
                const tiltX = message.readInt8(this.isWeDo2SmartHub ? 2 : 4);
                const tiltY = message.readInt8(this.isWeDo2SmartHub ? 3 : 5);
                /**
                 * Emits when a tilt sensor is activated.
                 * @event LPF2Hub#tilt
                 * @param {number} x
                 * @param {number} y
                 */
                this.emit("tilt", tiltX, tiltY);
                break;
        }
    }

}

export namespace TiltSensor {
    export enum Mode {
        TILT = 0x00
    }
}