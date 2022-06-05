import { Device } from "./device";
import { IDeviceInterface } from "../interfaces";
import * as Consts from "../consts";
import { calculateRamp } from "../utils";

/**
 * @class Light
 * @extends Device
 */
export class Light extends Device {


    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.LIGHT);
    }


    /**
     * Set the light brightness.
     * @method Light#setBrightness
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @param {boolean} interrupt If true, previous commands are discarded.
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public setBrightness (brightness: number, interrupt: boolean = false) {
        return this.writeDirect(0x00, Buffer.from([brightness]), interrupt);
    }


    /**
     * Ramp the light brightness.
     * @method Light#rampBrightness
     * @param {number} fromBrightness Brightness value between 0-100 (0 is off)
     * @param {number} toBrightness Brightness value between 0-100 (0 is off)
     * @param {number} time How long the ramp should last (in milliseconds).
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public rampBrightness (fromBrightness: number, toBrightness: number, time: number) {
        const powerValues = calculateRamp(fromBrightness, toBrightness, time);
        powerValues.forEach(value => {
            this.setBrightness(value);
            this.addPortOutputSleep(Math.round(time/powerValues.length));
        });
        return this.setBrightness(toBrightness);
    }

}
