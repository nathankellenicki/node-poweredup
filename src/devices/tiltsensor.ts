import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TiltSensor
 * @extends Device
 */
export class TiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "tilt", // ANGLE
                input: true,
                output: false,
                weDo2SmartHub: true,
                raw: { min: -90, max: 90 },
                pct: { min: -100, max: 100 },
                si: { min: -90, max: 90, symbol: "DEG" },
                values: { count: 2, type: Consts.ValueType.Int8 }
            }
        ]
        super(hub, portId, modes, Consts.DeviceType.TILT_SENSOR);

        this._eventHandlers.tilt = (data: IEventData) => {
            const [x, y] = data.si;
            /**
             * Emits when a tilt sensor is activated.
             * @event TiltSensor#tilt
             * @type {object}
             * @param {number} x
             * @param {number} y
             */
            this.notify("tilt", { x, y });
        };
    }
}
