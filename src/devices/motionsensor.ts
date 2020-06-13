import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MotionSensor
 * @extends Device
 */
export class MotionSensor extends Device {

    public static Mode = {
        DISTANCE: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "distance": MotionSensor.Mode.DISTANCE
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, MotionSensor.ModeMap, {}, Consts.DeviceType.MOTION_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case MotionSensor.Mode.DISTANCE:
                let distance = message[0];
                distance *= 10;
                /**
                 * Emits when a distance sensor is activated.
                 * @event MotionSensor#distance
                 * @type {object}
                 * @param {number} distance Distance, in millimeters.
                 */
                this.notify("distance", { distance });
                return message.slice(1);
        }

        return message;
    }

}
