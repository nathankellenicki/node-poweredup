import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicDistanceSensor
 * @extends Device
 */
export class TechnicDistanceSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "distance",
                input: true,
                output: false,
                raw: { min: 0, max: 2500 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 2500, symbol: "mm" },
                values: { count: 1, type: Consts.ValueType.Int16 }
            },
            {
                name: "fastDistance",
                input: true,
                output: false,
                raw: { min: 0, max: 320 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 320, symbol: "mm" },
                values: { count: 1, type: Consts.ValueType.Int16 }
            },
            {
                name: "UNKNOW-2",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "UNKNOW-3",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "UNKNOW-4",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "brightness",
                input: false,
                output: true,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "" },
                values: { count: 4, type: Consts.ValueType.Int8 }
            }
        ]
        super(hub, portId, modes, Consts.DeviceType.TECHNIC_DISTANCE_SENSOR);

        this._eventHandlers.distance = (data: IEventData) => {
            const [distance] = data.raw;
            /**
             * Emits when the detected distance changes (Slow sampling covers 40mm to 2500mm).
             * @event TechnicDistanceSensor#distance
             * @type {object}
             * @param {number} distance Distance, from 40 to 2500mm
             */
            this.notify("distance", { distance });
        };
        this._eventHandlers.fastDistance = (data: IEventData) => {
            const [fastDistance] = data.raw;
            /**
             * Emits when the detected distance changes (Fast sampling covers 50mm to 320mm).
             * @event TechnicDistanceSensor#fastDistance
             * @type {object}
             * @param {number} fastDistance Distance, from 50 to 320mm
             */
            this.notify("fastDistance", { fastDistance });
        };
    }

    /**
     * Set the brightness (or turn on/off) of the lights around the eyes.
     * @method TechnicDistanceSensor#setBrightness
     * @param {number} topLeft Top left quadrant (above left eye). 0-100 brightness.
     * @param {number} bottomLeft Bottom left quadrant (below left eye). 0-100 brightness.
     * @param {number} topRight Top right quadrant (above right eye). 0-100 brightness.
     * @param {number} bottomRight Bottom right quadrant (below right eye). 0-100 brightness.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setBrightness (topLeft: number, bottomLeft: number, topRight: number, bottomRight: number) {
        this.writeDirect(0x05, Buffer.from([topLeft, topRight, bottomLeft, bottomRight]));
    }

}

export enum Mode {
    DISTANCE = 0x00,
    FAST_DISTANCE = 0x01
}

export const ModeMap: {[event: string]: number} = {
    "distance": Mode.DISTANCE,
    "fastDistance": Mode.FAST_DISTANCE
};
