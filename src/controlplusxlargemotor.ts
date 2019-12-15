import { Hub } from "./hub";

import * as Consts from "./consts";
import { TachoMotor } from "./tachomotor";

export class ControlPlusXLargeMotor extends TachoMotor {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.CONTROL_PLUS_XLARGE_MOTOR);
    }

}
