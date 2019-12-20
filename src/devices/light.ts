import { Device } from "./device";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

import { DeviceType, HubType } from "../consts";

export class Light extends Device {


    constructor (hub: IDeviceInterface, portId: number, modes: {[name: string]: IDeviceMode} = {}, type: DeviceType = DeviceType.LIGHT) {
        super(hub, portId, modes, type);
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
