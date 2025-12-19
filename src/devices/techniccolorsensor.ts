import { Device } from "./device.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";
import { parseColor } from "../utils.js";

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
        let hue;
        let saturation;
        let value;
        let intensity;

        switch (mode) {
            case Mode.COLOR:
                if (message.length !== 5) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
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

            case Mode.REFLECT:
                if (message.length !== 5) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                const reflect = message[4];
                /**
                 * Emits when the light reflectivity changes.
                 * @event TechnicColorSensor#reflect
                 * @type {object}
                 * @param {number} reflect Percentage, from 0 to 100.
                 */
                this.notify("reflect", { reflect });
                break;

            case Mode.AMBIENT:
                if (message.length !== 5) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                const ambient = message[4];
                /**
                 * Emits when the ambient light changes.
                 * @event TechnicColorSensor#ambient
                 * @type {object}
                 * @param {number} ambient Percentage, from 0 to 100.
                 */
                this.notify("ambient", { ambient });
                break;

            case Mode.RGB_I:
                if (this.isWeDo2SmartHub) {
                    break;
                }
                if (message.length !== 12) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                const red = message.readUInt16LE(4);
                const green = message.readUInt16LE(6);
                const blue = message.readUInt16LE(8);
                intensity = message.readUInt16LE(10);
                /**
                 * Emits when a color sensor is activated. Measured with light on.
                 * @event TechnicColorSensor#rgbIntensity
                 * @type {object}
                 * @param {number} red
                 * @param {number} green
                 * @param {number} blue
                 * @param {number} intensity
                 */
                this.notify("rgbIntensity", { red, green, blue, intensity });
                break;

            case Mode.HSV:
                if (this.isWeDo2SmartHub) {
                    break;
                }
                if (message.length !== 10) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                hue = message.readUInt16LE(4);
                saturation = message.readUInt16LE(6);
                value = message.readUInt16LE(8);
                /**
                 * Emits when a color sensor is activated. Measured with light on.
                 * @event TechnicColorSensor#hsvIntensity
                 * @type {object}
                 * @param {number} hue
                 * @param {number} saturation
                 * @param {number} value
                 */
                this.notify("hsvIntensity", { hue, saturation, value });
                break;

            case Mode.SHSV:
                if (this.isWeDo2SmartHub) {
                    break;
                }
                if (message.length !== 12) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                hue = message.readUInt16LE(4);
                saturation = message.readUInt16LE(6);
                value = message.readUInt16LE(8);
                intensity = message.readUInt16LE(10);
                /**
                 * Emits when a color sensor is activated. Measured with light off.
                 * @event TechnicColorSensor#hsvAmbient
                 * @type {object}
                 * @param {number} hue
                 * @param {number} saturation
                 * @param {number} value
                 * @param {number} intensity
                 */
                this.notify("hsvAmbient", { hue, saturation, value, intensity });
                break;
        }
    }

    /**
     * Set the brightness (or turn on/off) of the lights around the sensor.
     * @param {number} firstSegment First light segment. 0-100 brightness.
     * @param {number} secondSegment Second light segment. 0-100 brightness.
     * @param {number} thirdSegment Third light segment. 0-100 brightness.
     * @returns {Promise<CommandFeedback>} Resolved upon completion of the command.
     */
    public setBrightness (firstSegment: number, secondSegment: number, thirdSegment: number) {
        this.subscribe(Mode.LIGHT); // other modes use different light setting
        return this.writeDirect(Mode.LIGHT, Buffer.from([firstSegment, secondSegment, thirdSegment]));
    }

}

export enum Mode {
    COLOR = 0x00,
    REFLECT = 0x01,
    AMBIENT = 0x02,
    LIGHT = 0x03,
    RGB_I = 0x05,
    HSV = 0x06,
    SHSV = 0x07
}

export const ModeMap: {[event: string]: number} = {
    "color": Mode.COLOR,
    "reflect": Mode.REFLECT,
    "ambient": Mode.AMBIENT,
    "rgbIntensity": Mode.RGB_I,
    "hsvIntensity": Mode.HSV,
    "hsvAmbient": Mode.SHSV
};
