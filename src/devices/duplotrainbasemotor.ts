import { BasicMotor } from "./basicmotor.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

/**
 * @class DuploTrainBaseMotor
 * @extends BasicMotor
 */
export class DuploTrainBaseMotor extends BasicMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_MOTOR);
    }

}
