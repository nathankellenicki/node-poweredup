import { BasicMotor } from "./basicmotor.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

/**
 * @class SimpleMediumLinearMotor
 * @extends Device
 */
export class SimpleMediumLinearMotor extends BasicMotor {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.SIMPLE_MEDIUM_LINEAR_MOTOR);
    }

}
