import { AbsoluteMotor } from "./absolutemotor";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicLargeAngularMotor
 * @extends AbsoluteMotor
 */
export class TechnicLargeAngularMotor extends AbsoluteMotor {

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR);
    }

}
