import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class VoltageSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, VoltageSensor.ModeMap, Consts.DeviceType.VOLTAGE_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case VoltageSensor.Mode.VOLTAGE:
                let maxVoltageValue = VoltageSensor.MaxVoltageValue[this.hub.type];
                if (maxVoltageValue === undefined) {
                    maxVoltageValue = VoltageSensor.MaxVoltageValue[Consts.HubType.UNKNOWN];
                }
                let maxVoltageRaw = VoltageSensor.MaxVoltageRaw[this.hub.type];
                if (maxVoltageRaw === undefined) {
                    maxVoltageRaw = VoltageSensor.MaxVoltageRaw[Consts.HubType.UNKNOWN];
                }
                const voltage = message.readUInt16LE(4) * maxVoltageValue / maxVoltageRaw;
                /**
                 * Emits when a voltage change is detected.
                 * @event VoltageSensor#voltage
                 * @param {number} voltage
                 */
                this.emit("voltage", voltage);
                break;
        }
    }

}

export namespace VoltageSensor {

    export enum Mode {
        VOLTAGE = 0x00
    }

    export const ModeMap: {[event: string]: number} = {
        "voltage": VoltageSensor.Mode.VOLTAGE
    }

    export const MaxVoltageValue: {[hubType: number]: number} = {
        [Consts.HubType.UNKNOWN]: 9.615,
        [Consts.HubType.DUPLO_TRAIN_HUB]: 6.4,
        [Consts.HubType.POWERED_UP_REMOTE]: 6.4,
    }

    export const MaxVoltageRaw: {[hubType: number]: number} = {
        [Consts.HubType.UNKNOWN]: 3893,
        [Consts.HubType.DUPLO_TRAIN_HUB]: 3047,
        [Consts.HubType.POWERED_UP_REMOTE]: 3200,
        [Consts.HubType.CONTROL_PLUS_HUB]: 4095,
    }
    
}