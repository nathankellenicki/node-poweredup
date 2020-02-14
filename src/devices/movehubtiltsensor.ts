import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MoveHubTiltSensor
 * @extends Device
 */
export class MoveHubTiltSensor extends Device {

    public static Mode = {
        TILT: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "tilt": MoveHubTiltSensor.Mode.TILT
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, MoveHubTiltSensor.ModeMap, {}, Consts.DeviceType.MOVE_HUB_TILT_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case MoveHubTiltSensor.Mode.TILT:
                /**
                 * Emits when a tilt sensor is activated.
                 * @event MoveHubTiltSensor#tilt
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 */
                const x = -message.readInt8(4);
                const y = message.readInt8(5);
                this.notify("tilt", { x, y });
                break;
        }
    }

}
