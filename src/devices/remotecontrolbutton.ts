import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class RemoteControlButton
 * @extends Device
 */
export class RemoteControlButton extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.REMOTE_CONTROL_BUTTON);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.BUTTON_EVENTS:
                /**
                 * Emits when a button on the remote is pressed or released.
                 * @event RemoteControlButton#button
                 * @type {object}
                 * @param {number} event
                 */
                const event = message[4];
                this.notify("remoteButton", { event });
                break;
        }
    }

}

export enum Mode {
    BUTTON_EVENTS = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "remoteButton": Mode.BUTTON_EVENTS
};

export const ButtonState: {[state: string]: number} = {
    "UP": 0x01,
    "DOWN": 0xff,
    "STOP": 0x7f,
    "RELEASED": 0x00,
};
