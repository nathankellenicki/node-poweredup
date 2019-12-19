import { Device } from "./device";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

import { DeviceType, HubType, ValueType } from "../consts";

export class CurrentSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, CurrentSensor.modes, DeviceType.CURRENT_SENSOR);
    }
}

export namespace CurrentSensor {
    export const modes: { [name: string]: IDeviceMode } = {
        CURRENT: {
            /**
             * Emits when a current change is detected.
             * @event CurrentSensor#current
             * @param {number} current
             */
            input: true,
            event: "current",
            values: { type: ValueType.UInt8, count: 1, min: 0, max: 255 },
            num: {
                [HubType.MOVE_HUB]: 0x00,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x00,
                [HubType.HUB]: 0x00,
                [HubType.WEDO2_SMART_HUB]: 0x00
            },
            transform(hubType, data) {
                const maxCurrentValue = CurrentSensor.MaxCurrentValue[hubType] || CurrentSensor.MaxCurrentValue[HubType.UNKNOWN];
                const maxCurrentRaw = CurrentSensor.MaxCurrentRaw[hubType] || CurrentSensor.MaxCurrentRaw[HubType.UNKNOWN];
                return [data[0] * maxCurrentValue / maxCurrentRaw];
            }
        }
    };

    export const MaxCurrentValue: {[hubType: number]: number} = {
        [HubType.UNKNOWN]: 2444,
        [HubType.TECHNIC_MEDIUM_HUB]: 4175,
    }

    export const MaxCurrentRaw: {[hubType: number]: number} = {
        [HubType.UNKNOWN]: 4095,
    }
}