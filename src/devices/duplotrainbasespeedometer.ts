import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class DuploTrainBaseSpeedometer extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, DuploTrainBaseSpeedometer.ModeMap, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER);
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