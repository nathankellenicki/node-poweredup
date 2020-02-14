import { BasicMotor } from "./basicmotor";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTrainBaseMotor
 * @extends BasicMotor
 */
export class DuploTrainBaseMotor extends BasicMotor {

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_MOTOR);
    }

}
