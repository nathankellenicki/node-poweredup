import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

export class Light extends Device {
    protected static _type = 8;


    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion, modes: {[name: string]: IDeviceMode} = {}) {
        super(hub, portId, versions, modes);
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
