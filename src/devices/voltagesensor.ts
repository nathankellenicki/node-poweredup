import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class VoltageSensor
 * @extends Device
 */
export class VoltageSensor extends Device {
    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "voltage", // VLT L
                input: true,
                output: false,
                raw: {min: 0, max: MaxVoltageRaw[hub.type] || MaxVoltageRaw[Consts.HubType.UNKNOWN]},
                pct: {min: 0, max: 100},
                si: {min: 0, max: MaxVoltageValue[hub.type] || MaxVoltageValue[Consts.HubType.UNKNOWN], symbol: "mV"},
                values: {count: 1, type: Consts.ValueType.Int16}
            },
            {
                name: "VLT S",
                input: true,
                output: false,
                raw: {min: 0, max: MaxVoltageRaw[hub.type] || MaxVoltageRaw[Consts.HubType.UNKNOWN]},
                pct: {min: 0, max: 100},
                si: {min: 0, max: MaxVoltageValue[hub.type] || MaxVoltageValue[Consts.HubType.UNKNOWN], symbol: "mV"},
                values: {count: 1, type: Consts.ValueType.Int16}
            }
        ];

        super(hub, portId, modes, Consts.DeviceType.VOLTAGE_SENSOR);

        this._eventHandlers.voltage = (data: IEventData) => {
            const [voltage] = data.si;
            /**
             * Emits when a voltage change is detected.
             * @event VoltageSensor#voltage
             * @type {object}
             * @param {number} voltage
             */
            this.notify("voltage", { voltage });
        };
    }
}

const MaxVoltageValue: {[hubType: number]: number} = {
    [Consts.HubType.UNKNOWN]: 9.615,
    [Consts.HubType.DUPLO_TRAIN_BASE]: 6.4,
    [Consts.HubType.REMOTE_CONTROL]: 6.4,
};

const MaxVoltageRaw: {[hubType: number]: number} = {
    [Consts.HubType.UNKNOWN]: 3893,
    [Consts.HubType.DUPLO_TRAIN_BASE]: 3047,
    [Consts.HubType.REMOTE_CONTROL]: 3200,
    [Consts.HubType.TECHNIC_MEDIUM_HUB]: 4095,
};
