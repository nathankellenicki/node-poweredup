import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class Light extends Device {


    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.LIGHT);
    }


    /**
     * Set the light brightness.
     * @method Light#brightness
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public setBrightness (brightness: number) {
        return new Promise((resolve) => {
            this.writeDirect(0x00, Buffer.from([brightness]));
            return resolve();
        });
    }


}
