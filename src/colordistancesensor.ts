import { Device } from "./device";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class ColorDistanceSensor extends Device {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.COLOR_DISTANCE_SENSOR);
    }

}
