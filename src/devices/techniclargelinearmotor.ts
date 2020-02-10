import { AbsoluteMotor } from "./absolutemotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicLargeLinearMotor
 * @extends AbsoluteMotor
 */
export class TechnicLargeLinearMotor extends AbsoluteMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.TECHNIC_LARGE_LINEAR_MOTOR);
    }

}
