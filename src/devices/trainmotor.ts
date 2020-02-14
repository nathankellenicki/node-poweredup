import { BasicMotor } from "./basicmotor";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TrainMotor
 * @extends BasicMotor
 */
export class TrainMotor extends BasicMotor {

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.TRAIN_MOTOR);
    }

}
