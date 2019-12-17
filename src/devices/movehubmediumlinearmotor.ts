import { TachoMotor } from "./tachomotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class MoveHubMediumLinearMotor extends TachoMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.MOVE_HUB_MEDIUM_LINEAR_MOTOR);
    }

}
