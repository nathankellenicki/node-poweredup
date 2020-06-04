import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TiltSensor
 * @extends Device
 */
export class TiltSensor extends Device {


    public static Mode = {
        TILT: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "tilt": TiltSensor.Mode.TILT
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TiltSensor.ModeMap, {}, Consts.DeviceType.TILT_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TiltSensor.Mode.TILT:
                const x = message.readInt8(this.isWeDo2SmartHub ? 2 : 0);
                const y = message.readInt8(this.isWeDo2SmartHub ? 3 : 1);
                /**
                 * Emits when a tilt sensor is activated.
                 * @event TiltSensor#tilt
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 */
                this.notify("tilt", { x, y });
                return message.slice(2);
        }

        return message;
    }

}
