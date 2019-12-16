import { Hub } from "./hub";

import * as Consts from "./consts";
import { TachoMotor } from "./tachomotor";

export class MoveHubMediumLinearMotor extends TachoMotor {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.MOVE_HUB_MEDIUM_LINEAR_MOTOR);
    }

}
