import { Hub } from "./hub";

import * as Consts from "./consts";
import { TachoMotor } from "./tachomotor";

export class MediumLinearMotor extends TachoMotor {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.MEDIUM_LINEAR_MOTOR);
    }

}
