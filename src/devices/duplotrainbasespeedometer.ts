import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTraniBaseSpeedometer
 * @extends Device
 */
export class DuploTrainBaseSpeedometer extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "speed",
                input: true,
                output: false,
                raw: { min: -100, max: 100 },
                pct: { min: -100, max: 100 },
                si: { min: -100, max: 100, symbol: "" },
                values: { count: 1, type: Consts.ValueType.Int16 }
            }
        ]
        super(hub, portId, modes, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER);

        this._eventHandlers.color = (data: IEventData) => {
            const [speed] = data.raw;
            /**
             * Emits on a speed change.
             * @event DuploTrainBaseSpeedometer#speed
             * @type {object}
             * @param {number} speed
             */
            this.notify("speed", { speed });
        };
    }

}
