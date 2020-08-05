import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubAccelerometerSensor
 * @extends Device
 */
export class TechnicMediumHubAccelerometerSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "accel", // GRV
                input: true,
                output: false,
                raw: {min: -32768, max: 32768},
                pct: {min: -100, max: 100},
                si: {min: -8000, max: 8000, symbol: "mG"},
                values: {count: 3, type: Consts.ValueType.Int16}
            },
            {
                name: "CAL",
                input: true,
                output: false,
                raw: {min: 1, max: 1},
                pct: {min: -100, max: 100},
                si: {min: 1, max: 1, symbol: ""},
                values: {count: 1, type: Consts.ValueType.Int8}
            },
            {
                name: "CFG",
                input: false,
                output: true,
                raw: {min: 0, max: 255},
                pct: {min: 0, max: 100},
                si: {min: 0, max: 255, symbol: ""},
                values: {count: 2, type: Consts.ValueType.Int8}
            }
        ]
        super(hub, portId, modes, Consts.DeviceType.TECHNIC_MEDIUM_HUB_ACCELEROMETER);

        this._eventHandlers.accel = (data: IEventData) => {
            const [x, y, z] = data.si;
            /**
             * Emits when accelerometer detects movement. Measured in mG.
             * @event TechnicMediumHubAccelerometerSensor#accel
             * @type {object}
             * @param {number} x
             * @param {number} y
             * @param {number} z
             */
            this.notify("accel", { x, y, z });
        };
    }
}
