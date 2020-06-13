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

    public static DataSets = {
        [TechnicForceSensor.Mode.FORCE]: 1,
        [TechnicForceSensor.Mode.TOUCHED]: 1,
        [TechnicForceSensor.Mode.TAPPED]: 1
    }

    public static ModeMap: {[event: string]: number} = {
        "force": TechnicForceSensor.Mode.FORCE,
        "touched": TechnicForceSensor.Mode.TOUCHED,
        "tapped": TechnicForceSensor.Mode.TAPPED
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicForceSensor.ModeMap, TechnicForceSensor.DataSets, Consts.DeviceType.TECHNIC_FORCE_SENSOR);
        this._supportsCombined = true;
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicForceSensor.Mode.FORCE:
                const force = message[this.isWeDo2SmartHub ? 2 : 4] / 10;

                /**
                 * Emits when force is applied.
                 * @event TechnicForceSensor#force
                 * @type {object}
                 * @param {number} force Force, in newtons (0-10).
                 */
                this.notify("force", { force });
                return message.slice(1);

            case TechnicForceSensor.Mode.TOUCHED:
                const touched = message[0] ? true : false;

                /**
                 * Emits when the sensor is touched.
                 * @event TechnicForceSensor#touch
                 * @type {object}
                 * @param {boolean} touch Touched on/off (boolean).
                 */
                this.notify("touched", { touched });
                return message.slice(1);

            case TechnicForceSensor.Mode.TAPPED:
                const tapped = message[0];

                /**
                 * Emits when the sensor is tapped.
                 * @event TechnicForceSensor#tapped
                 * @type {object}
                 * @param {number} tapped How hard the sensor was tapped, from 0-3.
                 */
                this.notify("tapped", { tapped });
                return message.slice(1);
        }

        return message;
    }

}
