import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class TiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, Consts.DeviceType.TILT_SENSOR);

        this.on("newListener", (event) => {
            if (this.autoSubscribe) {
                switch (event) {
                    case "tilt":
                        this.subscribe(TiltSensor.Mode.TILT);
                        break;
                }
            }
        });
    }

    public receive (message: Buffer) {
        const mode = this._mode;
        const isWeDo2 = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);

        switch (mode) {
            case TiltSensor.Mode.TILT:
                const tiltX = message.readInt8(isWeDo2 ? 2 : 4);
                const tiltY = message.readInt8(isWeDo2 ? 3 : 5);
                /**
                 * Emits when a tilt sensor is activated.
                 * @event LPF2Hub#tilt
                 * @param {number} x
                 * @param {number} y
                 */
                this.emit("tilt", tiltX, tiltY);
                break;
        }
    }

}

export namespace TiltSensor {
    export enum Mode {
        TILT = 0x00
    }
}