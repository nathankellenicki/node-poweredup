import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MoveHubTiltSensor
 * @extends Device
 */
export class MoveHubTiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "tilt", // ANGLE
                input: true,
                output: false,
                raw: { min: -90, max: 90 },
                pct: { min: -100, max: 100 },
                si: { min: -90, max: 90, symbol: "DEG" },
                values: { count: 2, type: Consts.ValueType.Int8 }
            },
            {
                name: "TILT",
                input: true,
                output: false,
                raw: { min: 0, max: 10 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 10, symbol: "DIR" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "ORINT",
                input: true,
                output: false,
                raw: { min: 0, max: 5 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 5, symbol: "DIR" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "IMPCT",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "IMP" },
                values: { count: 1, type: Consts.ValueType.Int32 }
            },
            {
                name: "ACCEL",
                input: true,
                output: false,
                raw: { min: -65, max: 65 },
                pct: { min: -100, max: 100 },
                si: { min: -65, max: 65, symbol: "ACC" },
                values: { count: 3, type: Consts.ValueType.Int8 }
            },
            {
                name: "OR_CF",
                input: true,
                output: false,
                raw: { min: 0, max: 6 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 6, symbol: "SID" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "IM_CF",
                input: true,
                output: false,
                raw: { min: 0, max: 255 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 255, symbol: "SEN" },
                values: { count: 2, type: Consts.ValueType.Int8 }
            },
            {
                name: "CALIB",
                input: true,
                output: false,
                raw: { min: 0, max: 255 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 255, symbol: "CAL" },
                values: { count: 3, type: Consts.ValueType.Int8 }
            }

        ]
        super(hub, portId, modes, Consts.DeviceType.MOVE_HUB_TILT_SENSOR);

        this._eventHandlers.tilt = (data: IEventData) => {
            const [x, y] = data.si;
            /**
             * Emits when a tilt sensor is activated.
             * @event TechnicMediumHubTiltSensor#tilt
             * @type {object}
             * @param {number} x
             * @param {number} y
             */
            this.notify("tilt", { x, y });
        };
    }

}

export enum Mode {
    TILT = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "tilt": Mode.TILT
};
