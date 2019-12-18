import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class ColorDistanceSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ColorDistanceSensor.ModeMap, Consts.DeviceType.COLOR_DISTANCE_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case ColorDistanceSensor.Mode.COLOR:
                if (message[this.isWeDo2SmartHub ? 2 : 4] <= 10) {
                    const color = message[this.isWeDo2SmartHub ? 2 : 4];

                    /**
                     * Emits when a color sensor is activated.
                     * @event ColorDistanceSensor#color
                     * @param {Color} color
                     */
                    this.emit("color", color);
                }
                break;

            case ColorDistanceSensor.Mode.DISTANCE:
                if (this.isWeDo2SmartHub) {
                    break;
                }
                if (message[4] <= 10) {
                    const distance = Math.floor(message[4] * 25.4) - 20;

                    /**
                     * Emits when a distance sensor is activated.
                     * @event ColorDistanceSensor#distance
                     * @param {number} distance Distance, in millimeters.
                     */
                    this.emit("distance", distance);
                }
                break;

            case ColorDistanceSensor.Mode.COLOR_AND_DISTANCE:
                if (this.isWeDo2SmartHub) {
                    break;
                }

                let distance = message[5];
                const partial = message[7];

                if (partial > 0) {
                    distance += 1.0 / partial;
                }

                distance = Math.floor(distance * 25.4) - 20;

                /**
                 * A combined color and distance event, emits when the sensor is activated.
                 * @event ColorDistanceSensor#colorAndDistance
                 * @param {Color} color
                 * @param {number} distance Distance, in millimeters.
                 */
                if (message[4] <= 10) {
                    const color = message[4];
                    this.emit("colorAndDistance", color, distance);
                }
                break;

        }
    }

}

export namespace ColorDistanceSensor {

    export enum Mode {
        COLOR = 0x00,
        DISTANCE = 0x01,
        COLOR_AND_DISTANCE = 0x08
    }

    export const ModeMap: {[event: string]: number} = {
        "color": ColorDistanceSensor.Mode.COLOR,
        "distance": ColorDistanceSensor.Mode.DISTANCE,
        "colorAndDistance": ColorDistanceSensor.Mode.COLOR_AND_DISTANCE
    }

}