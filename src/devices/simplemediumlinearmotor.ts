import { BasicMotor } from "./generic/basicmotor";

import { IDeviceInterface } from "../interfaces";

import { DeviceVersion } from "./generic/device";

export class SimpleMediumLinearMotor extends BasicMotor {
    protected static _type = 1;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
    }

}
