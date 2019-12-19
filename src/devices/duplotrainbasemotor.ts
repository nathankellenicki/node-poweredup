import { BasicMotor } from "./basicmotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class DuploTrainBaseMotor extends BasicMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_MOTOR);
    }

}
