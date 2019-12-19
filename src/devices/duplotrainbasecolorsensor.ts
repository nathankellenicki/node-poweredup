import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class DuploTrainBaseColorSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, DuploTrainBaseColorSensor.ModeMap, Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case DuploTrainBaseColorSensor.Mode.COLOR:
                if (message[4] <= 10) {
                    const color = message[4];

                    /**
                     * Emits when a color sensor is activated.
                     * @event DuploTrainBaseColorSensor#color
                     * @param {Color} color
                     */
                    this.emit("color", color);
                }
                break;

        }
    }

}

export namespace DuploTrainBaseColorSensor {

    export enum Mode {
        COLOR = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "color": DuploTrainBaseColorSensor.Mode.COLOR
    }

}