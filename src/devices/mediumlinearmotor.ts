import { TachoMotor } from "./generic/tachomotor";
import { DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

export class MediumLinearMotor extends TachoMotor {
    protected static _type = 38;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
    }

}
