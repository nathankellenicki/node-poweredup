import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class VoltageSensor
 * @extends Device
 */
export class VoltageSensor extends Device {

    public static Mode = {
        VOLTAGE: 0x00
    }

    public static ModeMap: {[event: string]: number} = {
        "voltage": VoltageSensor.Mode.VOLTAGE
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, VoltageSensor.ModeMap, {}, Consts.DeviceType.VOLTAGE_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case VoltageSensor.Mode.VOLTAGE:
                if (this.isWeDo2SmartHub) {
                    const voltage = message.readInt16LE(0) / 40;
                    this.notify("voltage", { voltage });
                } else {
                    let maxVoltageValue = MaxVoltageValue[this.hub.type];
                    if (maxVoltageValue === undefined) {
                        maxVoltageValue = MaxVoltageValue[Consts.HubType.UNKNOWN];
                    }
                    let maxVoltageRaw = MaxVoltageRaw[this.hub.type];
                    if (maxVoltageRaw === undefined) {
                        maxVoltageRaw = MaxVoltageRaw[Consts.HubType.UNKNOWN];
                    }
                    const voltage = message.readUInt16LE(0) * maxVoltageValue / maxVoltageRaw;

                    /**
                     * Emits when a voltage change is detected.
                     * @event VoltageSensor#voltage
                     * @type {object}
                     * @param {number} voltage
                     */
                    this.notify("voltage", { voltage });
                }
                return message.slice(2);
        }

        return message;
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
