import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";
import { parseColor } from "../utils";

/**
 * @class TechnicColorSensor
 * @extends Device
 */
export class TechnicColorSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.TECHNIC_COLOR_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.COLOR:
                if (message[4] <= 10) {
                    const color = parseColor(message[4]);

                    /**
                     * Emits when a color sensor is activated.
                     * @event TechnicColorSensor#color
                     * @type {object}
                     * @param {Color} color
                     */
                    this.notify("color", { color });
                }
                break;

            case Mode.REFLECTIVITY:
                const reflect = message[4];

                /**
                 * Emits when the light reflectivity changes.
                 * @event TechnicColorSensor#reflect
                 * @type {object}
                 * @param {number} reflect Percentage, from 0 to 100.
                 */
                this.notify("reflect", { reflect });
                break;

            case Mode.AMBIENT_LIGHT:
                const ambient = message[4];

                /**
                 * Emits when the ambient light changes.
                 * @event TechnicColorSensor#ambient
                 * @type {object}
                 * @param {number} ambient Percentage, from 0 to 100.
                 */
                this.notify("ambient", { ambient });
                break;
        }
    }

    /**
     * Set the brightness (or turn on/off) of the lights around the sensor.
     * @method TechnicColorSensor#setBrightness
     * @param {number} firstSegment First light segment. 0-100 brightness.
     * @param {number} secondSegment Second light segment. 0-100 brightness.
     * @param {number} thirdSegment Third light segment. 0-100 brightness.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setBrightness (firstSegment: number, secondSegment: number, thirdSegment: number) {
        this.writeDirect(0x03, Buffer.from([firstSegment, secondSegment, thirdSegment]));
    }

}

export enum Mode {
    COLOR = 0x00,
    REFLECTIVITY = 0x01,
    AMBIENT_LIGHT = 0x02
}

export const ModeMap: {[event: string]: number} = {
    "color": Mode.COLOR,
    "reflect": Mode.REFLECTIVITY,
    "ambient": Mode.AMBIENT_LIGHT
};
