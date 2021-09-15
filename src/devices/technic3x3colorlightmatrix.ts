import { Color } from "../color";

import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class Technic3x3ColorLightMatrix
 * @extends Device
 */
export class Technic3x3ColorLightMatrix extends Device {


    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.TECHNIC_3X3_COLOR_LIGHT_MATRIX);
    }


    /**
     * Set the LED matrix, one color per LED
     * @method Technic3x3ColorLightMatrix#setMatrix
     * @param {Color[] | Color} colors Array of 9 colors, 9 Color objects, or a single color
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setMatrix (colors: number[] | number) {
        return new Promise<void>((resolve) => {
            this.subscribe(Mode.PIX_0);
            const colorArray = new Array(9);
            for (let i = 0; i < colorArray.length; i++) {
                if (typeof colors ===  'number') {
                    // @ts-ignore
                    colorArray[i] = colors + (10 << 4);
                }
                // @ts-ignore
                if (colors[i] instanceof Color) {
                    // @ts-ignore
                    colorArray[i] = colors[i].toValue();
                }
                // @ts-ignore
                if (colors[i] === Consts.Color.NONE) {
                    colorArray[i] = Consts.Color.NONE;
                }
                // @ts-ignore
                if (colors[i] <= 10) {
                    // @ts-ignore
                    colorArray[i] = colors[i] + (10 << 4); // If a raw color value, set it to max brightness (10)
                }
            }
            this.writeDirect(Mode.PIX_0, Buffer.from(colorArray));
            return resolve();
        });
    }


}

export enum Mode {
    LEV_0 = 0x00,
    COL_0 = 0x01,
    PIX_0 = 0x02,
    TRANS = 0x03
}
