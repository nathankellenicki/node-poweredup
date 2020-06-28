import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class RemoteControlButton
 * @extends Device
 */
export class RemoteControlButton extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "button", // RCKEY
                input: true,
                output: false,
                raw: { min: -1, max: 1 },
                pct: { min: -100, max: 100 },
                si: { min: -1, max: 1, symbol: "btn" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "KEYA ",
                input: true,
                output: false,
                raw: { min: -1, max: 1 },
                pct: { min: -100, max: 100 },
                si: { min: -1, max: 1, symbol: "btn" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "KEYR ",
                input: true,
                output: false,
                raw: { min: -1, max: 1 },
                pct: { min: -100, max: 100 },
                si: { min: -1, max: 1, symbol: "btn" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "KEYD ",
                input: true,
                output: false,
                raw: { min: 0, max: 7 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 7, symbol: "btn" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "KEYSD",
                input: true,
                output: false,
                raw: { min: 0, max: 1 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 1, symbol: "btn" },
                values: { count: 3, type: Consts.ValueType.Int8 }
            }
        ]

        super(hub, portId, modes, Consts.DeviceType.REMOTE_CONTROL_BUTTON);

        this._eventHandlers.color = (data: IEventData) => {
            const [event] = data.raw;
            /**
             * Emits when a button on the remote is pressed or released.
             * @event RemoteControlButton#button
             * @type {object}
             * @param {number} event
             */
            this.notify("remoteButton", { event });
        };
    }

}

export const ButtonState: {[state: string]: number} = {
    "UP": 0x01,
    "DOWN": 0xff,
    "STOP": 0x7f,
    "RELEASED": 0x00,
};
