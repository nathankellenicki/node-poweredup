import { AbsoluteMotor } from "./absolutemotor";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumAngularMotor
 * @extends AbsoluteMotor
 */
export class TechnicMediumAngularMotor extends AbsoluteMotor {

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.TECHNIC_MEDIUM_ANGULAR_MOTOR);
    }

}
