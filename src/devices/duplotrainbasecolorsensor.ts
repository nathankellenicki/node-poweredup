import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

export class DuploTrainBaseColorSensor extends Device {
    protected static _type = 43;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, DuploTrainBaseColorSensor.ModeMap);
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
                    this.emitGlobal("color", color);
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