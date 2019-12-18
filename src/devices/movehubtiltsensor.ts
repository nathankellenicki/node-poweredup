import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class MoveHubTiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, MoveHubTiltSensor.ModeMap, Consts.DeviceType.MOVE_HUB_TILT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case MoveHubTiltSensor.Mode.TILT:
                /**
                 * Emits when a tilt sensor is activated.
                 * @event MoveHubTiltSensor#tilt
                 * @param {number} x
                 * @param {number} y
                 */
                const tiltX = -(message.readInt8(4));
                const tiltY = message.readInt8(5);
                this.emit("tilt", tiltX, tiltY);
                break;
        }
    }

}

export namespace MoveHubTiltSensor {

    export enum Mode {
        TILT = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "tilt": MoveHubTiltSensor.Mode.TILT
    }
    
}