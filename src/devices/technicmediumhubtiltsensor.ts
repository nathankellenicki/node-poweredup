import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class TechnicMediumHubTiltSensor extends Device {
    protected static _type = 59;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, TechnicMediumHubTiltSensor.ModeMap);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case TechnicMediumHubTiltSensor.Mode.TILT:
                /**
                 * Emits when a tilt sensor is activated.
                 * @event TechnicMediumHubTiltSensor#tilt
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                const tiltZ = message.readInt16LE(4);
                const tiltY = message.readInt16LE(6);
                const tiltX = message.readInt16LE(8);
                this.emitGlobal("tilt", tiltX, tiltY, -tiltZ);
                break;
        }
    }

}

export namespace TechnicMediumHubTiltSensor {

    export enum Mode {
        TILT = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "tilt": TechnicMediumHubTiltSensor.Mode.TILT
    }

}