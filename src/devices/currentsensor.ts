import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class CurrentSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, CurrentSensor.ModeMap, Consts.DeviceType.CURRENT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case CurrentSensor.Mode.CURRENT:
                let maxCurrentValue = CurrentSensor.MaxCurrentValue[this.hub.type];
                if (maxCurrentValue === undefined) {
                    maxCurrentValue = CurrentSensor.MaxCurrentValue[Consts.HubType.UNKNOWN];
                }
                let maxCurrentRaw = CurrentSensor.MaxCurrentRaw[this.hub.type];
                if (maxCurrentRaw === undefined) {
                    maxCurrentRaw = CurrentSensor.MaxCurrentRaw[Consts.HubType.UNKNOWN];
                }
                const current = message.readUInt16LE(4) * maxCurrentValue / maxCurrentRaw;
                /**
                 * Emits when a current change is detected.
                 * @event CurrentSensor#current
                 * @param {number} current
                 */
                this.emit("current", current);
                break;
        }
    }

}

export namespace CurrentSensor {

    export enum Mode {
        CURRENT = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "current": CurrentSensor.Mode.CURRENT
    }

    export const MaxCurrentValue: {[hubType: number]: number} = {
        [Consts.HubType.UNKNOWN]: 2444,
        [Consts.HubType.CONTROL_PLUS_HUB]: 4175,
    }

    export const MaxCurrentRaw: {[hubType: number]: number} = {
        [Consts.HubType.UNKNOWN]: 4095,
    }
    
}