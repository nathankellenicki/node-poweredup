import { TachoMotor } from "./tachomotor";

import { IDeviceInterface } from "./interfaces";

import * as Consts from "./consts";

export class TechnicXLargeLinearMotor extends TachoMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, Consts.DeviceType.TECHNIC_XLARGE_LINEAR_MOTOR);
    }

}
