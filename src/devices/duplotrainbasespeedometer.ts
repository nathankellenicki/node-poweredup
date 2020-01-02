import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

export class DuploTrainBaseSpeedometer extends Device {
    protected static _type = 44;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, DuploTrainBaseSpeedometer.ModeMap);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case DuploTrainBaseSpeedometer.Mode.SPEED:
                const speed = message.readInt16LE(4);

                /**
                 * Emits on a speed change.
                 * @event DuploTrainBaseSpeedometer#speed
                 * @param {number} speed
                 */
                this.emitGlobal("speed", speed);
                break;

        }
    }

}

export namespace DuploTrainBaseSpeedometer {

    export enum Mode {
        SPEED = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "speed": DuploTrainBaseSpeedometer.Mode.SPEED
    }

}