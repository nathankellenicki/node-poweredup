import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicColorSensor
 * @extends Device
 */
export class TechnicColorSensor extends Device {

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
                name: "reflect",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "PCT" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "ambient",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "PCT" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "brightness",
                input: false,
                output: true,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "PCT" },
                values: { count: 3, type: Consts.ValueType.Int8 }
            }
        ]
        super(hub, portId, modes, Consts.DeviceType.TECHNIC_COLOR_SENSOR);


        this._eventHandlers.color = (data: IEventData) => {
            const [color] = data.raw;
            /**
             * Emits when a color sensor is activated.
             * @event TechnicColorSensor#color
             * @type {object}
             * @param {Color} color
             */
            this.notify("color", { color });
        };
        this._eventHandlers.reflect = (data: IEventData) => {
            const [reflect] = data.raw;
            /**
             * Emits when the light reflectivity changes.
             * @event TechnicColorSensor#reflect
             * @type {object}
             * @param {number} reflect Percentage, from 0 to 100.
             */
            this.notify("reflect", { reflect });
        };
        this._eventHandlers.ambient = (data: IEventData) => {
            const [ambient] = data.raw;
            /**
             * Emits when the ambient light changes.
             * @event TechnicColorSensor#ambient
             * @type {object}
             * @param {number} ambient Percentage, from 0 to 100.
             */
            this.notify("ambient", { ambient });
        };

    }

    /**
     * Set the brightness (or turn on/off) of the lights around the sensor.
     * @method TechnicColorSensor#setBrightness
     * @param {number} firstSegment First light segment. 0-100 brightness.
     * @param {number} secondSegment Second light segment. 0-100 brightness.
     * @param {number} thirdSegment Third light segment. 0-100 brightness.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setBrightness (firstSegment: number, secondSegment: number, thirdSegment: number) {
        this.writeDirect(0x03, Buffer.from([firstSegment, secondSegment, thirdSegment]));
    }

}
