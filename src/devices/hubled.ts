import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class HubLED extends Device {


    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.HUB_LED);
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method HubLED#setColor
     * @param {Color} color
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            if (this.mode !== HubLED.Mode.COLOR) {
                this.subscribe(HubLED.Mode.COLOR);
            }
            if (typeof color === "boolean") {
                color = 0;
            }
            this.send(Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, color]));
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
            if (this.mode !== HubLED.Mode.RGB) {
                this.subscribe(HubLED.Mode.RGB);
            }
            this.send(Buffer.from([0x81, this.portId, 0x11, 0x51, 0x01, red, green, blue]));
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
                this.send(data, Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            } else {
                const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, brightness]);
                this.send(data);
            }
            return resolve();
        });
    }


}

export namespace HubLED {

    export enum Mode {
        COLOR = 0x00,
        RGB = 0x01
    }

}