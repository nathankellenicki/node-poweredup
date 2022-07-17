import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicForceSensor
 * @extends Device
 */
export class TechnicForceSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.TECHNIC_FORCE_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.FORCE:
                const force = message[this.isWeDo2SmartHub ? 2 : 4] / 10;

                /**
                 * Emits when force is applied.
                 * @event TechnicForceSensor#force
                 * @type {object}
                 * @param {number} force Force, in newtons (0-10).
                 */
                this.notify("force", { force });
                break;

            case Mode.TOUCHED:
                const touched = message[4] ? true : false;

                /**
                 * Emits when the sensor is touched.
                 * @event TechnicForceSensor#touch
                 * @type {object}
                 * @param {boolean} touch Touched on/off (boolean).
                 */
                this.notify("touched", { touched });
                break;

            case Mode.TAPPED:
                const tapped = message[4];

                /**
                 * Emits when the sensor is tapped.
                 * @event TechnicForceSensor#tapped
                 * @type {object}
                 * @param {number} tapped How hard the sensor was tapped, from 0-3.
                 */
                this.notify("tapped", { tapped });
                break;
        }
    }

}

export enum Mode {
    FORCE = 0x00,
    TOUCHED = 0x01,
    TAPPED = 0x02
}

export const ModeMap: {[event: string]: number} = {
    "force": Mode.FORCE,
    "touched": Mode.TOUCHED,
    "tapped": Mode.TAPPED
};
