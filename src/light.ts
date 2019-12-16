import { Device } from "./device";
import { Hub } from "./hub";
import { WeDo2SmartHub } from "./wedo2smarthub";

import * as Consts from "./consts";

export class Light extends Device {


    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.LIGHT);
    }


    /**
     * Set the light brightness.
     * @method Light#brightness
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public setBrightness (brightness: number) {
        return new Promise((resolve) => {
            if (this.hub instanceof WeDo2SmartHub) {
                const data = Buffer.from([this.portId, 0x01, 0x02, brightness]);
                this.send(data, Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            } else {
                const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, brightness]);
                this.send(data);
            }
            return resolve();
        });
    }


}
