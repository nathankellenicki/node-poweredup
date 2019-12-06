import { BasicMotor } from "./basicmotor";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class TrainMotor extends BasicMotor {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.TRAIN_MOTOR);
    }

}
