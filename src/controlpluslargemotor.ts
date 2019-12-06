import { BasicMotor } from "./basicmotor";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class ControlPlusLargeMotor extends BasicMotor {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.CONTROL_PLUS_LARGE_MOTOR);
    }

}
