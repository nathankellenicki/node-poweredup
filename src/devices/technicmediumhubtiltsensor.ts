import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubTiltSensor
 * @extends Device
 */
export class TechnicMediumHubTiltSensor extends Device {

    public static Mode = {
        TILT: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "tilt": TechnicMediumHubTiltSensor.Mode.TILT
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicMediumHubTiltSensor.ModeMap, {}, Consts.DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicMediumHubTiltSensor.Mode.TILT:
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
                return message.slice(6);
        }

        return message;
    }

}
