import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubAccelerometerSensor
 * @extends Device
 */
export class TechnicMediumHubAccelerometerSensor extends Device {

    public static Mode = {
        ACCEL: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "accel": TechnicMediumHubAccelerometerSensor.Mode.ACCEL
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicMediumHubAccelerometerSensor.ModeMap, {}, Consts.DeviceType.TECHNIC_MEDIUM_HUB_ACCELEROMETER);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicMediumHubAccelerometerSensor.Mode.ACCEL:
                /**
                 * Emits when accelerometer detects movement. Measured in mG.
                 * @event TechnicMediumHubAccelerometerSensor#accel
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                const x = Math.round(message.readInt16LE(4) / 4.096);
                const y = Math.round(message.readInt16LE(6) / 4.096);
                const z = Math.round(message.readInt16LE(8) / 4.096);
                this.notify("accel", { x, y, z });
                return message.slice(6);
        }

        return message;
    }

}
