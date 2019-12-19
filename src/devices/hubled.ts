import { Device } from "./device";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

import { BLECharacteristic, DeviceType, HubType, ValueType } from "../consts";

export class HubLED extends Device {


    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, DeviceType.HUB_LED);
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method HubLED#setColor
     * @param {Color} color
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            if (typeof color === "boolean") {
                color = 0;
            }
            this.sendWithMode("COLOR", Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, color]));
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via RGB values.
     * @method HubLED#setRGB
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setRGB (red: number, green: number, blue: number) {
        return new Promise((resolve, reject) => {
            this.sendWithMode("RGB", Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, red, green, blue]));
            return resolve();
        });
    }



    /**
     * Set the light brightness.
     * @method Light#brightness
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public setBrightness (brightness: number) {
        return new Promise((resolve) => {
            if (this.isWeDo2SmartHub) {
                const data = Buffer.from([this.portId, 0x01, 0x02, brightness]);
                this.send(data, BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            } else {
                const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, brightness]);
                this.send(data);
            }
            return resolve();
        });
    }


}

export namespace HubLED {
    export const modes: { [name: string]: IDeviceMode } = {
        COLOR: {
            input: false,
            num: {
                [HubType.MOVE_HUB]: 0x00,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x00,
                [HubType.HUB]: 0x00,
                [HubType.WEDO2_SMART_HUB]: 0x00
            }
        },
        RGB: {
            input: false,
            num: {
                [HubType.MOVE_HUB]: 0x01,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x01,
                [HubType.HUB]: 0x01,
                [HubType.WEDO2_SMART_HUB]: 0x01
            }
        }
    };
}