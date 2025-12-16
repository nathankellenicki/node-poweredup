import { AbsoluteMotor } from "./absolutemotor.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

/**
 * @class TechnicSmallAngularMotor
 * @extends AbsoluteMotor
 */
export class TechnicSmallAngularMotor extends AbsoluteMotor {

    constructor (hub: IDeviceInterface, portId: number, modeMap: {[event: string]: number} = {}, type: Consts.DeviceType = Consts.DeviceType.TECHNIC_SMALL_ANGULAR_MOTOR) {
        super(hub, portId, {}, type);
    }

}
