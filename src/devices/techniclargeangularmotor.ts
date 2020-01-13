import { AbsoluteMotor } from "./absolutemotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class TechnicLargeAngularMotor extends AbsoluteMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR);
    }

}
