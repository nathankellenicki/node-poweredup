import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

import { HubType, ValueType } from "../consts";

export class VoltageSensor extends Device {
    protected static _type = 20;

    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, VoltageSensor.modes);
    }
}

export namespace VoltageSensor {
    export const modes: { [name: string]: IDeviceMode } = {
        VOLTAGE: {
            /**
             * Emits when a voltage change is detected.
             * @event VoltageSensor#voltage
             * @param {number} current
             */
            input: true,
            event: "voltage",
            values: { type: ValueType.UInt8, count: 1, min: 0, max: 255 },
            num: {
                [HubType.MOVE_HUB]: 0x00,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x00,
                [HubType.HUB]: 0x00,
                [HubType.WEDO2_SMART_HUB]: 0x00
            },
            transform(hubType, data) {
                const maxVoltageValue = VoltageSensor.MaxVoltageValue[hubType] || VoltageSensor.MaxVoltageValue[HubType.UNKNOWN];
                const maxVoltageRaw = VoltageSensor.MaxVoltageRaw[hubType] || VoltageSensor.MaxVoltageRaw[HubType.UNKNOWN];
                return [data[0] * maxVoltageValue / maxVoltageRaw];
            }
        }
    };

    export const MaxVoltageValue: {[hubType: number]: number} = {
        [HubType.UNKNOWN]: 9.615,
        [HubType.DUPLO_TRAIN_BASE]: 6.4,
        [HubType.REMOTE_CONTROL]: 6.4,
    }

    export const MaxVoltageRaw: {[hubType: number]: number} = {
        [HubType.UNKNOWN]: 3893,
        [HubType.DUPLO_TRAIN_BASE]: 3047,
        [HubType.REMOTE_CONTROL]: 3200,
        [HubType.TECHNIC_MEDIUM_HUB]: 4095,
    }

}