import { BasicMotor } from "./basicmotor";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class SimpleMediumLinearMotor
 * @extends Device
 */
export class SimpleMediumLinearMotor extends BasicMotor {

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.SIMPLE_MEDIUM_LINEAR_MOTOR);
    }

}
