import { Device } from "./device";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class MotionSensor extends Device {

    constructor (hub: Hub, portId: number) {
        super(hub, portId, Consts.DeviceType.MOTION_SENSOR);

        this.on("newListener", (event) => {
            if (this.autoSubscribe) {
                switch (event) {
                    case "distance":
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
                let distance = message[4];
                if (message[5] === 1) {
                    distance = message[4] + 255;
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
