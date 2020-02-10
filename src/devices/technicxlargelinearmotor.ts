import { AbsoluteMotor } from "./absolutemotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicXLargeLinearMotor
 * @extends AbsoluteMotor
 */
export class TechnicXLargeLinearMotor extends AbsoluteMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.TECHNIC_XLARGE_LINEAR_MOTOR);
    }

}
