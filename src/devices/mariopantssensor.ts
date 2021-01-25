import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MarioPantsSensor
 * @extends Device
 */
export class MarioPantsSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.MARIO_PANTS_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.PANTS:
                /**
                 * Emits when the user changes the pants on Mario.
                 * @event MarioPantsSensor#pants
                 * @type {object}
                 * @param {number} pants
                 */
                const pants = message[4];
                this.notify("pants", { pants });
                break;
        }
    }

}

export enum Mode {
    PANTS = 0x00,
}

export const ModeMap: {[event: string]: number} = {
    "pants": Mode.PANTS,
};
