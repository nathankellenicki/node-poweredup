import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTraniBaseSpeedometer
 * @extends Device
 */
export class DuploTrainBaseSpeedometer extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.SPEED:
                const speed = message.readInt16LE(4);

                /**
                 * Emits on a speed change.
                 * @event DuploTrainBaseSpeedometer#speed
                 * @type {object}
                 * @param {number} speed
                 */
                this.notify("speed", { speed });
                break;

        }
    }

}

export enum Mode {
    SPEED = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "speed": Mode.SPEED
};
