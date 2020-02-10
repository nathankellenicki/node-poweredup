import { BasicMotor } from "./basicmotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TrainMotor
 * @extends BasicMotor
 */
export class TrainMotor extends BasicMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.TRAIN_MOTOR);
    }

}
