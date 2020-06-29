import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MotionSensor
 * @extends Device
 */
export class MotionSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "distance", // PROX
                input: true,
                output: false,
                weDo2SmartHub: true,
                raw: { min: 0, max: 512 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 5120, symbol: "mm" },
                values: { count: 1, type: Consts.ValueType.Int16 }
            }
        ]
        super(hub, portId, modes, Consts.DeviceType.MOTION_SENSOR);

        this._eventHandlers.distance = (data: IEventData) => {
            const [distance] = data.si;
            /**
             * Emits when a distance sensor is activated.
             * @event MotionSensor#distance
             * @type {object}
             * @param {number} distance Distance, in millimeters.
             */
            this.notify("distance", { distance });
        };
    }
}

export enum Mode {
    DISTANCE = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "distance": Mode.DISTANCE
};
