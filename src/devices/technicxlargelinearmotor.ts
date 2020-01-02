import { TachoMotor } from "./generic/tachomotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";
import { DeviceVersion } from "./generic/device";

export class TechnicXLargeLinearMotor extends TachoMotor {
    protected static _type = 47;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
    }

}
