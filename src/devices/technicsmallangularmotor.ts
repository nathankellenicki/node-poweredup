import { AbsoluteMotor } from "./absolutemotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicSmallAngularMotor
 * @extends AbsoluteMotor
 */
export class TechnicSmallAngularMotor extends AbsoluteMotor {

    constructor (hub: IDeviceInterface, portId: number, modeMap: {[event: string]: number} = {}, type: Consts.DeviceType = Consts.DeviceType.TECHNIC_SMALL_ANGULAR_MOTOR) {
        super(hub, portId, {}, type);
    }

}
