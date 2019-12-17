import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class MotionSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, Consts.DeviceType.MOTION_SENSOR);

        this.on("newListener", (event) => {
            if (this.autoSubscribe) {
                switch (event) {
                    case "distance":
                        this.subscribe(MotionSensor.Mode.DISTANCE);
                        break;
                }
            }
        });
    }

    public receive (message: Buffer) {
        const mode = this._mode;
        const isWeDo2 = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);

        switch (mode) {
            case MotionSensor.Mode.DISTANCE:
                let distance = message[isWeDo2 ? 2 : 4];
                if (message[isWeDo2 ? 3 : 5] === 1) {
                    distance = distance + 255;
                }
                /**
                 * Emits when a distance sensor is activated.
                 * @event MotionSensor#distance
                 * @param {number} distance Distance, in millimeters.
                 */
                this.emit("distance", distance * 10);
                break;
        }
    }

}

export namespace MotionSensor {
    export enum Mode {
        DISTANCE = 0x00
    }
}