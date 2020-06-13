import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class RemoteControlButton
 * @extends Device
 */
export class RemoteControlButton extends Device {

    public static Mode = {
        BUTTON_EVENTS: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "remoteButton": RemoteControlButton.Mode.BUTTON_EVENTS
    };

    public static ButtonState: {[state: string]: number} = {
        "UP": 0x01,
        "DOWN": 0xff,
        "STOP": 0x7f,
        "RELEASED": 0x00,
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, RemoteControlButton.ModeMap, {}, Consts.DeviceType.REMOTE_CONTROL_BUTTON);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case RemoteControlButton.Mode.BUTTON_EVENTS:
                /**
                 * Emits when a button on the remote is pressed or released.
                 * @event RemoteControlButton#button
                 * @type {object}
                 * @param {number} event
                 */
                const event = message[0];
                this.notify("remoteButton", { event });
                return message.slice(1);
        }

        return message;
    }

}
