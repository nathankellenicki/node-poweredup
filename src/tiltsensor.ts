import { Device } from "./device";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class TiltSensor extends Device {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.TILT_SENSOR);

        this.on("newListener", (event) => {
            if (this.autoSubscribe) {
                switch (event) {
                    case "tilt":
                        this.subscribe(0x00);
                        break;
                }
            }
        });
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case 0x00:
                const tiltX = message.readInt8(4);
                const tiltY = message.readInt8(5);
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
