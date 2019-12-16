import { Hub } from "./hub";

import * as Consts from "./consts";
import { TachoMotor } from "./tachomotor";

export class TechnicXLargeLinearMotor extends TachoMotor {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.TECHNIC_XLARGE_LINEAR_MOTOR);
    }

}
