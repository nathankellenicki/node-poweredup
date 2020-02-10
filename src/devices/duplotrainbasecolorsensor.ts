import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTrainBaseColorSensor
 * @extends Device
 */
export class DuploTrainBaseColorSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.COLOR:
                if (message[4] <= 10) {
                    const color = message[4];

                    /**
                     * Emits when a color sensor is activated.
                     * @event DuploTrainBaseColorSensor#color
                     * @type {object}
                     * @param {Color} color
                     */
                    this.notify("color", { color });
                }
                break;

        }
    }

}

export enum Mode {
    COLOR = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "color": Mode.COLOR
};
