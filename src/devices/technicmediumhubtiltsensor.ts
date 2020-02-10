import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubTiltSensor
 * @extends Device
 */
export class TechnicMediumHubTiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.TILT:
                /**
                 * Emits when a tilt sensor is activated.
                 * @event TechnicMediumHubTiltSensor#tilt
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                const z = -message.readInt16LE(4);
                const y = message.readInt16LE(6);
                const x = message.readInt16LE(8);
                this.notify("tilt", { x, y, z });
                break;
        }
    }

}

export enum Mode {
    TILT = 0x00
}

export const ModeMap: {[event: string]: number} = {
    "tilt": Mode.TILT
};
