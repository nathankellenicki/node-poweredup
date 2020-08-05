import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubGyroSensor
 * @extends Device
 */
export class TechnicMediumHubGyroSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "gyro",
                input: true,
                output: false,
                raw: {min: -28571.419921875, max: 28571.419921875},
                pct: {min: -100, max: 100},
                si: {min: -2000, max: 2000, symbol: "DPS"},
                values: {count: 3, type: Consts.ValueType.Int16}
            }
        ];
        super(hub, portId, modes, Consts.DeviceType.TECHNIC_MEDIUM_HUB_GYRO_SENSOR);

        this._eventHandlers.gyro = (data: IEventData) => {
            const [x, y, z] = data.si;
            /**
             * Emits when gyroscope detects movement. Measured in DPS - degrees per second.
             * @event TechnicMediumHubGyroSensor#gyro
             * @type {object}
             * @param {number} x
             * @param {number} y
             * @param {number} z
             */
            this.notify("gyro", { x, y, z });
        };
    }
}
