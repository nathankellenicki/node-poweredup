import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicColorSensor
 * @extends Device
 */
export class TechnicColorSensor extends Device {


public static Mode = {
    COLOR: 0x00,
    REFLECTIVITY: 0x01,
    AMBIENT_LIGHT: 0x02
}

public static DataSets = {
    [TechnicColorSensor.Mode.COLOR]: 1,
    [TechnicColorSensor.Mode.REFLECTIVITY]: 1,
    [TechnicColorSensor.Mode.AMBIENT_LIGHT]: 1
}

public static ModeMap: {[event: string]: number} = {
    "color": TechnicColorSensor.Mode.COLOR,
    "reflect": TechnicColorSensor.Mode.REFLECTIVITY,
    "ambient": TechnicColorSensor.Mode.AMBIENT_LIGHT
};


    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicColorSensor.ModeMap, TechnicColorSensor.DataSets, Consts.DeviceType.TECHNIC_COLOR_SENSOR);
        this._supportsCombined = true;
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicColorSensor.Mode.COLOR:
                if (message[0] <= 10) {
                    const color = message[0];

                    /**
                     * Emits when a color sensor is activated.
                     * @event TechnicColorSensor#color
                     * @type {object}
                     * @param {Color} color
                     */
                    this.notify("color", { color });
                }
                return message.slice(1);

            case TechnicColorSensor.Mode.REFLECTIVITY:
                const reflect = message[0];

                /**
                 * Emits when the light reflectivity changes.
                 * @event TechnicColorSensor#reflect
                 * @type {object}
                 * @param {number} reflect Percentage, from 0 to 100.
                 */
                this.notify("reflect", { reflect });
                return message.slice(1);

            case TechnicColorSensor.Mode.AMBIENT_LIGHT:
                const ambient = message[0];

                /**
                 * Emits when the ambient light changes.
                 * @event TechnicColorSensor#ambient
                 * @type {object}
                 * @param {number} ambient Percentage, from 0 to 100.
                 */
                this.notify("ambient", { ambient });
                return message.slice(1);
        }

        return message;
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