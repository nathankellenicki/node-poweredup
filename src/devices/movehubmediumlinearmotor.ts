import { TachoMotor } from "./generic/tachomotor";

import { IDeviceInterface } from "../interfaces";

import { DeviceVersion } from "./generic/device";

export class MoveHubMediumLinearMotor extends TachoMotor {
    protected static _type = 39;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
    }

}
