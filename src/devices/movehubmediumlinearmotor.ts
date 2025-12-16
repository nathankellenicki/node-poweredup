import { TachoMotor } from "./tachomotor.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

/**
 * @class MoveHubMediumLinearMotor
 * @extends TachoMotor
 */
export class MoveHubMediumLinearMotor extends TachoMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.MOVE_HUB_MEDIUM_LINEAR_MOTOR);
    }

}
