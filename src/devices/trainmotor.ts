import { BasicMotor } from "./basicmotor.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

/**
 * @class TrainMotor
 * @extends BasicMotor
 */
export class TrainMotor extends BasicMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.TRAIN_MOTOR);
    }

}
