import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

export class TiltSensor extends Device {
    protected static _type = 34;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, TiltSensor.ModeMap);
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
                this.emitGlobal("tilt", tiltX, tiltY);
                break;
        }
    }

}

export namespace TiltSensor {

    export enum Mode {
        TILT = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "tilt": TiltSensor.Mode.TILT
    }

}