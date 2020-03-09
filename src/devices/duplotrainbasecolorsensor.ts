import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTrainBaseColorSensor
 * @extends Device
 */
export class DuploTrainBaseColorSensor extends Device {

    public static Mode = {
        COLOR: 0x00,
        REFLECTIVITY: 0x02,
        RGB: 0x03
    }

    public static ModeMap: {[event: string]: number} = {
        "color": DuploTrainBaseColorSensor.Mode.COLOR,
        "reflect": DuploTrainBaseColorSensor.Mode.REFLECTIVITY,
        "rgb": DuploTrainBaseColorSensor.Mode.RGB
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
                break;

            case DuploTrainBaseColorSensor.Mode.REFLECTIVITY:
                const reflect = message[4];

                /**
                 * Emits when the light reflectivity changes.
                 * @event DuploTrainBaseColorSensor#reflect
                 * @type {object}
                 * @param {number} reflect Percentage, from 0 to 100.
                 */
                this.notify("reflect", { reflect });
                break;

            case DuploTrainBaseColorSensor.Mode.RGB:
                const red = Math.floor(message.readUInt16LE(4) / 4);
                const green = Math.floor(message.readUInt16LE(6) / 4);
                const blue = Math.floor(message.readUInt16LE(8) / 4);

                /**
                 * Emits when the light reflectivity changes.
                 * @event DuploTrainBaseColorSensor#rgb
                 * @type {object}
                 * @param {number} red
                 * @param {number} green
                 * @param {number} blue
                 */
                this.notify("rgb", { red, green, blue });
                break;

        }
    }

}
