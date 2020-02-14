import { TachoMotor } from "./tachomotor";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MediumLinearMotor
 * @extends TachoMotor
 */
export class MediumLinearMotor extends TachoMotor {

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.MEDIUM_LINEAR_MOTOR);
    }

}
