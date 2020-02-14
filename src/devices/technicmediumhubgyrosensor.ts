import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubGyroSensor
 * @extends Device
 */
export class TechnicMediumHubGyroSensor extends Device {

    public static Mode = {
        GYRO: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "gyro": TechnicMediumHubGyroSensor.Mode.GYRO
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicMediumHubGyroSensor.ModeMap, {}, Consts.DeviceType.TECHNIC_MEDIUM_HUB_GYRO_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicMediumHubGyroSensor.Mode.GYRO:
                /**
                 * Emits when gyroscope detects movement. Measured in DPS - degrees per second.
                 * @event TechnicMediumHubGyroSensor#gyro
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                const x = Math.round(message.readInt16LE(4) * 7 / 400);
                const y = Math.round(message.readInt16LE(6) * 7 / 400);
                const z = Math.round(message.readInt16LE(8) * 7 / 400);
                this.notify("gyro", { x, y, z });
                return message.slice(6);
        }

        return message;
    }

}
