import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class CurrentSensor
 * @extends Device
 */
export class CurrentSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "current", // CUR L
                input: true,
                output: false,
                raw: {min: 0, max: MaxCurrentRaw[hub.type] || MaxCurrentRaw[Consts.HubType.UNKNOWN]},
                pct: {min: 0, max: 100},
                si: {min: 0, max: MaxCurrentValue[hub.type] || MaxCurrentValue[Consts.HubType.UNKNOWN], symbol: "mA"},
                values: {count: 1, type: Consts.ValueType.Int16}
            },
            {
                name: "CUR S",
                input: true,
                output: false,
                raw: {min: 0, max: MaxCurrentRaw[hub.type] || MaxCurrentRaw[Consts.HubType.UNKNOWN]},
                pct: {min: 0, max: 100},
                si: {min: 0, max: MaxCurrentValue[hub.type] || MaxCurrentValue[Consts.HubType.UNKNOWN], symbol: "mA"},
                values: {count: 1, type: Consts.ValueType.Int16}
            }
        ]

        super(hub, portId, modes, Consts.DeviceType.CURRENT_SENSOR);

        this._eventHandlers.current = (data: IEventData) => {
            const [current] = data.si;
            /**
             * Emits when a current change is detected.
             * @event CurrentSensor#current
             * @type {object}
             * @param {number} current
             */
            this.notify("current", { current });
        };
    }

}

const MaxCurrentValue: {[hubType: number]: number} = {
    [Consts.HubType.UNKNOWN]: 2444,
    [Consts.HubType.TECHNIC_MEDIUM_HUB]: 4175,
};

const MaxCurrentRaw: {[hubType: number]: number} = {
    [Consts.HubType.UNKNOWN]: 4095,
};
