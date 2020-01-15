import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class TechnicColorSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.TECHNIC_COLOR_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.COLOR:
                if (message[4] <= 10) {
                    const color = message[4];

                    /**
                     * Emits when a color sensor is activated.
                     * @event TechnicColorSensor#color
                     * @param {Color} color
                     */
                    this.notify("color", { color });
                }
                break;

            case Mode.REFLECTIVITY:
                const reflect = message[4];

                /**
                 * Emits when the light reflectivity changes.
                 * @event TechnicColorSensor#reflect Percentage, from 0 to 100.
                 * @param {Color} reflect
                 */
                this.notify("reflect", { reflect });
                break;

            case Mode.AMBIENT_LIGHT:
                const ambient = message[4];

                /**
                 * Emits when the ambient light changes.
                 * @event TechnicColorSensor#ambient Percentage, from 0 to 100.
                 * @param {Color} ambient
                 */
                this.notify("ambient", { ambient });
                break;
        }
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
