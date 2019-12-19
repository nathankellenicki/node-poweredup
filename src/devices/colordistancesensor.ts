import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import { DeviceType, HubType, IDeviceMode, ValueType } from "../consts";

export class ColorDistanceSensor extends Device {
    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ColorDistanceSensor.modes, DeviceType.COLOR_DISTANCE_SENSOR);
    }

    public receive (message: Buffer) {
        const data = super.receive(message) || [];

        if (this._mode === "SPEC_1") {
            this.emit("color", data[0]);
            this.emit("distance", data[1]);
            this.emit("reflectivity", data[3]);
        }

        return data;
    }
}

export namespace ColorDistanceSensor {
    export const modes: { [name: string]: IDeviceMode } = {
        COLOR: {
            /**
             * Emits when a color sensor is activated.
             * @event ColorDistanceSensor#color
             * @param {string} port
             * @param {Color} color
             */
            input: true,
            event: "color",
            values: { type: ValueType.UInt8, count: 1, min: 0, max: 255 },
            num: {
                [HubType.MOVE_HUB]: 0x00,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x00,
                [HubType.HUB]: 0x00,
                [HubType.WEDO2_SMART_HUB]: 0x00
            }
        },
        PROX: {
            input: true,
            event: "distance",
            values: { type: ValueType.UInt8, count: 1, min: 0, max: 10 },
            num: {
                [HubType.MOVE_HUB]: 0x01,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x01,
                [HubType.HUB]: 0x01
            }
        },
        COUNT: {
            input: true,
            event: "count",
            values: { type: ValueType.UInt8, count: 1, min: 0 },
            num: {
                [HubType.MOVE_HUB]: 0x02,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x02,
                [HubType.HUB]: 0x02
            }
        },
        REFLT: {
            input: true,
            event: "reflectivity",
            values: { type: ValueType.UInt8, count: 1, min: 0, max: 100 },
            num: {
                [HubType.MOVE_HUB]: 0x03,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x03,
                [HubType.HUB]: 0x03
            }
        },
        AMBI: {
            input: true,
            event: "luminosity",
            values: { type: ValueType.UInt8, count: 1, min: 0, max: 100 },
            num: {
                [HubType.MOVE_HUB]: 0x04,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x04,
                [HubType.HUB]: 0x04
            }
        },
        SOME_OUTPUT_MODE: {
            input: false,
            num: {}
        },
        RGB_I: {
            input: true,
            event: "rgb",
            values: { type: ValueType.UInt8, count: 3, min: 0, max: 255 },
            num: {
                [HubType.MOVE_HUB]: 0x06,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x06,
                [HubType.HUB]: 0x06
            }
        },
        OTHER_OUTPUT_MODE: {
            input: false,
            num: {}
        },
        SPEC_1: {
            input: true,
            event: "colorAndDistance",
            values: { type: ValueType.UInt8, count: 4, min: 0, max: 255 },
            num: {
                [HubType.MOVE_HUB]: 0x08,
                [HubType.TECHNIC_MEDIUM_HUB]: 0x08,
                [HubType.HUB]: 0x08
            }
        }
    };
}
