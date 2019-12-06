import { BasicMotor } from "./basicmotor";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class SimpleMediumLinearMotor extends BasicMotor {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.SIMPLE_MEDIUM_LINEAR_MOTOR);
    }

}
