import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class ColorDistanceSensor extends Device {

    private _isWeDo2: boolean;

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, Consts.DeviceType.COLOR_DISTANCE_SENSOR);
        this._isWeDo2 = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);

        this.on("newListener", (event) => {
            if (this.autoSubscribe) {
                switch (event) {
                    case "color":
                        this.subscribe(ColorDistanceSensor.Mode.COLOR);
                        break;
                    case "distance":
                        this.subscribe(ColorDistanceSensor.Mode.DISTANCE);
                        break;
                    case "colorAndDistance":
                        this.subscribe(ColorDistanceSensor.Mode.COLOR_AND_DISTANCE);
                        break;
                }
            }
        });
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        console.log(message);

        switch (mode) {
            case ColorDistanceSensor.Mode.COLOR:
                if (this._isWeDo2 && message[2] <= 10) {
                    const color = message[2];
                    this.emit("color", color);
                }
                break;
            case ColorDistanceSensor.Mode.COLOR_AND_DISTANCE:
                /**
                 * Emits when a color sensor is activated.
                 * @event ColorDistanceSensor#color
                 * @param {string} port
                 * @param {Color} color
                 */
                if (message[4] <= 10) {
                    const color = message[4];
                    this.emit("color", color);
                }

                let distance = message[5];
                const partial = message[7];

                if (partial > 0) {
                    distance += 1.0 / partial;
                }

                distance = Math.floor(distance * 25.4) - 20;

                /**
                 * Emits when a distance sensor is activated.
                 * @event ColorDistanceSensor#distance
                 * @param {string} port
                 * @param {number} distance Distance, in millimeters.
                 */
                this.emit("distance", distance);

                /**
                 * A combined color and distance event, emits when the sensor is activated.
                 * @event ColorDistanceSensor#colorAndDistance
                 * @param {string} port
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
}