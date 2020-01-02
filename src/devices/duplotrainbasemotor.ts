import { BasicMotor } from "./generic/basicmotor";
import { DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class DuploTrainBaseMotor extends BasicMotor {
    protected static _type = 41;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
    }

}
