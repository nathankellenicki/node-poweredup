import { BasicMotor } from "./generic/basicmotor";
import { DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

export class TrainMotor extends BasicMotor {
    protected static _type = 2;
    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
    }
}
