import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTrainBaseColorSensor
 * @extends Device
 */
export class DuploTrainBaseColorSensor extends Device {

    public static Mode = {
        COLOR: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "color": DuploTrainBaseColorSensor.Mode.COLOR
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, DuploTrainBaseColorSensor.ModeMap, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case DuploTrainBaseColorSensor.Mode.COLOR:
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
                return message.slice(1);

        }

        return message;
    }

}
