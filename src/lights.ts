import { Device } from "./device";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class Lights extends Device {


    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.LED_LIGHTS);
    }


    /**
     * Set the light brightness.
     * @method Light#brightness
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public brightness (brightness: number) {
        return new Promise((resolve) => {
            const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, brightness]);
            this.send(data);
            return resolve();
        });
    }


}
