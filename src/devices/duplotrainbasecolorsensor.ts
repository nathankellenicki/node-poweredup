import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTrainBaseColorSensor
 * @extends Device
 */
export class DuploTrainBaseColorSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "color",
                input: true,
                output: false,
                raw: { min: 0, max: 10 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 10, symbol: "IDX" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "UNKNOW",
                input: false,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "PCT" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "reflect",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "PCT" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "rgb",
                input: true,
                output: false,
                raw: { min: 0, max: 1023 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 1023, symbol: "RAW" },
                values: { count: 3, type: Consts.ValueType.Int16 }
            }
        ];

        super(hub, portId, modes, Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR_SENSOR);

        this._eventHandlers.color = (data: IEventData) => {
            const [color] = data.raw;
            /**
             * Emits when a color sensor is activated.
             * @event DuploTrainBaseColorSensor#color
             * @type {object}
             * @param {Color} color
             */
            this.notify("color", { color });
        };
        this._eventHandlers.reflectivity = (data: IEventData) => {
            const [reflectivity] = data.raw;
            /**
             * Emits when the light reflectivity changes.
             * @event DuploTrainBaseColorSensor#reflectivity
             * @type {object}
             * @param {Reflectivity} reflectivity
             */
            this.notify("reflectivity", { reflectivity });
        };
        this._eventHandlers.rgb = (data: IEventData) => {
            const [r, g, b] = data.raw;
            /**
             * Emits when color sensor is activated.
             * @event DuploTrainBaseColorSensor#rgb
             * @type {object}
             * @param {number} red
             * @param {number} green
             * @param {number} blue
             */
            this.notify("distance", { r, g, b });
        };
    }
}
