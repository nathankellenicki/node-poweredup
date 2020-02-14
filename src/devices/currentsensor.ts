import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class CurrentSensor
 * @extends Device
 */
export class CurrentSensor extends Device {

    public static Mode = {
        CURRENT: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "current": CurrentSensor.Mode.CURRENT
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, CurrentSensor.ModeMap, {}, Consts.DeviceType.CURRENT_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case CurrentSensor.Mode.CURRENT:
                if (this.isWeDo2SmartHub) {
                    const current =  message.readInt16LE(2) / 1000;
                    this.notify("current", { current });
                } else {
                    let maxCurrentValue = MaxCurrentValue[this.hub.type];
                    if (maxCurrentValue === undefined) {
                        maxCurrentValue = MaxCurrentValue[Consts.HubType.UNKNOWN];
                    }
                    let maxCurrentRaw = MaxCurrentRaw[this.hub.type];
                    if (maxCurrentRaw === undefined) {
                        maxCurrentRaw = MaxCurrentRaw[Consts.HubType.UNKNOWN];
                    }
                    const current = message.readUInt16LE(4) * maxCurrentValue / maxCurrentRaw;
                    /**
                     * Emits when a current change is detected.
                     * @event CurrentSensor#current
                     * @type {object}
                     * @param {number} current
                     */
                    this.notify("current", { current });
                }
                break;
        }
    }

}

const MaxCurrentValue: {[hubType: number]: number} = {
    [Consts.HubType.UNKNOWN]: 2444,
    [Consts.HubType.TECHNIC_MEDIUM_HUB]: 4175,
};

const MaxCurrentRaw: {[hubType: number]: number} = {
    [Consts.HubType.UNKNOWN]: 4095,
};
