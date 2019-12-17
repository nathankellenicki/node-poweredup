import { BasicMotor } from "./basicmotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";
import { mapSpeed } from "../utils";

export class TachoMotor extends BasicMotor {

    constructor (hub: IDeviceInterface, portId: number, modeMap: {[event: string]: number} = {}, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, Object.assign({}, modeMap, {
            "rotate": TachoMotor.Mode.ROTATION
        }), type);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case TachoMotor.Mode.ROTATION:
                const rotation = message.readInt32LE(this.isWeDo2SmartHub ? 2 : 4);
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
     * @method TachoMotor#rotateByAngle
     * @param {number} angle How much the motor should be rotated (in degrees).
     * @param {number} [power=100] For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100.
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public rotateByAngle (angle: number, power: number = 100) {
        if (this.isWeDo2SmartHub) {
            throw new Error("Angle rotation is not available on the WeDo 2.0 Smart Hub");
        }
        return new Promise((resolve) => {
            this._busy = true;
            const message = Buffer.from([0x81, this.portId, 0x11, 0x0b, 0x00, 0x00, 0x00, 0x00, mapSpeed(power), 0x64, 0x7f, 0x03]);
            message.writeUInt32LE(angle, 4);
            this.send(message);
            this._finished = () => {
                return resolve();
            };
        });
    }

}

export namespace TachoMotor {
    export enum Mode {
        ROTATION = 0x02
    }
}