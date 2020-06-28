import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubTiltSensor
 * @extends Device
 */
export class TechnicMediumHubTiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "tilt", // POS
                input: false,
                output: true,
                raw: {min: -180, max: 180},
                pct: {min: -100, max: 100},
                si: {min: -180, max: 180, symbol: "DEG"},
                values: {count: 3, type: Consts.ValueType.Int16},
            },
            {
                name: "IMP",
                input: true,
                output: false,
                raw: {min: 0, max: 100},
                pct: {min: 0, max: 100},
                si: {min: 0, max: 100, symbol: "CNT"},
                values: {count: 1, type: Consts.ValueType.Int32},
            }
        ]
        super(hub, portId, modes, Consts.DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR);

        this._eventHandlers.tilt = (data: IEventData) => {
            const [x, y, z] = data.si;
            /**
             * Emits when a tilt sensor is activated.
             * @event TechnicMediumHubTiltSensor#tilt
             * @type {object}
             * @param {number} x
             * @param {number} y
             * @param {number} z
             */
            this.notify("tilt", { x, y, z });
        };
    }

}
