import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTraniBaseSpeedometer
 * @extends Device
 */
export class DuploTrainBaseSpeedometer extends Device {

    public static Mode = {
        SPEED: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "speed": DuploTrainBaseSpeedometer.Mode.SPEED
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, DuploTrainBaseSpeedometer.ModeMap, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case DuploTrainBaseSpeedometer.Mode.SPEED:
                const speed = message.readInt16LE(4);

                /**
                 * Emits on a speed change.
                 * @event DuploTrainBaseSpeedometer#speed
                 * @type {object}
                 * @param {number} speed
                 */
                this.notify("speed", { speed });
                return message.slice(2);

        }

        return message;
    }

}
