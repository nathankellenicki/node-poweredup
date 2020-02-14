import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicForceSensor
 * @extends Device
 */
export class TechnicForceSensor extends Device {

    public static Mode = {
        FORCE: 0x00,
        TOUCHED: 0x01,
        TAPPED: 0x02
    }

    public static ModeMap: {[event: string]: number} = {
        "force": TechnicForceSensor.Mode.FORCE,
        "touched": TechnicForceSensor.Mode.TOUCHED,
        "tapped": TechnicForceSensor.Mode.TAPPED
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicForceSensor.ModeMap, {}, Consts.DeviceType.TECHNIC_FORCE_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicForceSensor.Mode.FORCE:
                const force = message[4] / 10;

                /**
                 * Emits when force is applied.
                 * @event TechnicForceSensor#force
                 * @type {object}
                 * @param {number} force Force, in newtons (0-10).
                 */
                this.notify("force", { force });
                break;

            case TechnicForceSensor.Mode.TOUCHED:
                const touched = message[4] ? true : false;

                /**
                 * Emits when the sensor is touched.
                 * @event TechnicForceSensor#touch
                 * @type {object}
                 * @param {boolean} touch Touched on/off (boolean).
                 */
                this.notify("touched", { touched });
                break;

            case TechnicForceSensor.Mode.TAPPED:
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
