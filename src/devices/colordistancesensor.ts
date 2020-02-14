import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class ColorDistanceSensor
 * @extends Device
 */
export class ColorDistanceSensor extends Device {

    public static Mode = {
        COLOR: 0x00,
        DISTANCE: 0x01,
        COLOR_AND_DISTANCE: 0x08
    }

    public static DataSets = {
        [ColorDistanceSensor.Mode.COLOR]: 1,
        [ColorDistanceSensor.Mode.DISTANCE]: 1,
        [ColorDistanceSensor.Mode.COLOR_AND_DISTANCE]: 4
    }

    public static ModeMap: {[event: string]: number} = {
        "color": ColorDistanceSensor.Mode.COLOR,
        "distance": ColorDistanceSensor.Mode.DISTANCE,
        "colorAndDistance": ColorDistanceSensor.Mode.COLOR_AND_DISTANCE
    };


    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, ColorDistanceSensor.ModeMap, ColorDistanceSensor.DataSets, Consts.DeviceType.COLOR_DISTANCE_SENSOR);
        this._supportsCombined = true;
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case ColorDistanceSensor.Mode.COLOR:
                if (message[this.isWeDo2SmartHub ? 2 : 0] <= 10) {
                    const color = message[this.isWeDo2SmartHub ? 2 : 0];

                    /**
                     * Emits when a color sensor is activated.
                     * @event ColorDistanceSensor#color
                     * @type {object}
                     * @param {Color} color
                     */
                    this.notify("color", { color });
                }
                return message.slice(1);

            case ColorDistanceSensor.Mode.DISTANCE:
                if (this.isWeDo2SmartHub) {
                    break;
                }
                if (message[0] <= 10) {
                    const distance = Math.floor(message[0] * 25.4) - 20;

                    /**
                     * Emits when a distance sensor is activated.
                     * @event ColorDistanceSensor#distance
                     * @type {object}
                     * @param {number} distance Distance, in millimeters.
                     */
                    this.notify("distance", { distance });
                }
                return message.slice(1);

            default:
                if (this.isWeDo2SmartHub) {
                    break;
                }

                let distance = message[1];
                const partial = message[3];

                if (partial > 0) {
                    distance += 1.0 / partial;
                }

                distance = Math.floor(distance * 25.4) - 20;

                /**
                 * A combined color and distance event, emits when the sensor is activated.
                 * @event ColorDistanceSensor#colorAndDistance
                 * @type {object}
                 * @param {Color} color
                 * @param {number} distance Distance, in millimeters.
                 */
                if (message[0] <= 10) {
                    const color = message[4];
                    this.notify("colorAndDistance", { color, distance });
                }
                return message.slice(4);

        }
    }

}