import { TachoMotor } from "./generic/tachomotor";

import { IDeviceInterface } from "../interfaces";

import { DeviceVersion } from "./generic/device";

export class TechnicLargeLinearMotor extends TachoMotor {
    protected static _type = 46;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
    }

}
