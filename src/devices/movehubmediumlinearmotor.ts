import { TachoMotor } from "./tachomotor";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MoveHubMediumLinearMotor
 * @extends TachoMotor
 */
export class MoveHubMediumLinearMotor extends TachoMotor {

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.MOVE_HUB_MEDIUM_LINEAR_MOTOR);
    }

}
