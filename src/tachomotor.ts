import { BasicMotor } from "./basicmotor";
import { Hub } from "./hub";

import * as Consts from "./consts";
import { mapSpeed } from "./utils";

export class TachoMotor extends BasicMotor {

    constructor (hub: Hub, portId: number, type: number = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, type);

        this.on("newListener", (event) => {
            if (this.autoSubscribe) {
                switch (event) {
                    case "rotate":
                        this.subscribe(0x02);
                        break;
                }
            }
        });
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case 0x02:
                const rotation = message.readInt32LE(4);
                /**
                 * Emits when a rotation sensor is activated.
                 * @event TachoMotor#rotate
                 * @param {number} rotation
                 */
                this.emit("rotate", rotation);
                break;
        }
    }

    /**
     * Rotate a motor by a given angle.
     * @method TachoMotor#setMotorAngle
     * @param {number} angle How much the motor should be rotated (in degrees).
     * @param {number} [speed=100] For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100.
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public rotateByAngle (port: string, angle: number, speed: number = 100) {
        return new Promise((resolve) => {
            const message = Buffer.from([0x81, this.portId, 0x11, 0x0b, 0x00, 0x00, 0x00, 0x00, mapSpeed(speed), 0x64, 0x7f, 0x03]);
            message.writeUInt32LE(angle, 4);
            this.send(message);
            return resolve();
        });
    }

}
