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

public static ModeMap: {[event: string]: number} = {
    "color": TechnicColorSensor.Mode.COLOR,
    "reflect": TechnicColorSensor.Mode.REFLECTIVITY,
    "ambient": TechnicColorSensor.Mode.AMBIENT_LIGHT
};


    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicColorSensor.ModeMap, {}, Consts.DeviceType.TECHNIC_COLOR_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicColorSensor.Mode.COLOR:
                if (message[4] <= 10) {
                    const color = message[4];

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
                const reflect = message[4];

                /**
                 * Emits when the light reflectivity changes.
                 * @event TechnicColorSensor#reflect
                 * @type {object}
                 * @param {number} reflect Percentage, from 0 to 100.
                 */
                this.notify("reflect", { reflect });
                return message.slice(1);

            case TechnicColorSensor.Mode.AMBIENT_LIGHT:
                const ambient = message[4];

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

}
