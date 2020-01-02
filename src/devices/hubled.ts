import { Light } from "./light";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

import { BLECharacteristic, DeviceType, HubType } from "../consts";

export class HubLED extends Light {


    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, HubLED.modes, DeviceType.HUB_LED);
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

            if (this.isWeDo2SmartHub) {
                this.send(Buffer.from([0x06, 0x17, 0x01, 0x01]), BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
                this.send(Buffer.from([0x06, 0x04, 0x01, color]), BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            } else {
                this.subscribeAndWriteDirect("COLOR", Buffer.from([color]));
            }
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
            if (this.isWeDo2SmartHub) {
                this.send(Buffer.from([0x06, 0x17, 0x01, 0x02]), BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
                this.send(Buffer.from([0x06, 0x04, 0x03, red, green, blue]), BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            } else {
                this.subscribeAndWriteDirect("RGB", Buffer.from([red, green, blue]));
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