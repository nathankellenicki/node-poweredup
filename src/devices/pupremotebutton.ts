import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class PUPRemoteButton extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, PUPRemoteButton.ModeMap, Consts.DeviceType.PUP_REMOTE_BUTTON);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case PUPRemoteButton.Mode.BUTTON_EVENTS:
                /**
                 * Emits when a button on the remote is pressed or released.
                 * @event PUPRemoteButton#button
                 * @param {number} event
                 */
                const event = message[4];
                this.emit("button", event);
                break;
        }
    }

}

export namespace PUPRemoteButton {

    export enum Mode {
        BUTTON_EVENTS = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "button": PUPRemoteButton.Mode.BUTTON_EVENTS
    }

    export const ButtonState: {[state: string]: number} = {
        "UP": 0x01,
        "DOWN": 0xff,
        "STOP": 0x7f,
        "RELEASED": 0x00,
    }
    
}