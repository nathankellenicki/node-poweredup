import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicForceSensor
 * @extends Device
 */
export class TechnicForceSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "force",
                input: true,
                output: false,
                raw: { min: 0, max: 255 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 25.5, symbol: "N" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "touched",
                input: true,
                output: false,
                raw: { min: 0, max: 320 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 320, symbol: "" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "tapped",
                input: true,
                output: false,
                raw: { min: 0, max: 3 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 3, symbol: "" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
        ];

        super(hub, portId, modes, Consts.DeviceType.TECHNIC_FORCE_SENSOR);

        this._eventHandlers.force = (data: IEventData) => {
            const [force] = data.si;
            /**
             * Emits when force is applied.
             * @event TechnicForceSensor#force
             * @type {object}
             * @param {number} force Force, in newtons (0-10).
             */
            this.notify("force", { force });
        };
        this._eventHandlers.touched = (data: IEventData) => {
            const touched = !!data.raw[0];
            /**
             * Emits when the sensor is touched.
             * @event TechnicForceSensor#touch
             * @type {object}
             * @param {boolean} touch Touched on/off (boolean).
             */
            this.notify("touched", { touched });
        };
        this._eventHandlers.tapped = (data: IEventData) => {
            const [tapped] = data.raw;
            /**
             * Emits when the sensor is tapped.
             * @event TechnicForceSensor#tapped
             * @type {object}
             * @param {number} tapped How hard the sensor was tapped, from 0-3.
             */
            this.notify("tapped", { tapped });
        };
    }
}
