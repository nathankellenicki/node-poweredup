import { TachoMotor } from "./tachomotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";
import { mapSpeed, normalizeAngle, roundAngleToNearest90 } from "../utils";

/**
 * @class AbsoluteMotor
 * @extends TachoMotor
 */
export class AbsoluteMotor extends TachoMotor {

    constructor (hub: IDeviceInterface, portId: number, modeMap: {[event: string]: number} = {}, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super(hub, portId, Object.assign({}, modeMap, ModeMap), type);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.ABSOLUTE:
                const angle = normalizeAngle(message.readInt16LE(this.isWeDo2SmartHub ? 2 : 4));
                /**
                 * Emits when a the motors absolute position is changed.
                 * @event AbsoluteMotor#absolute
                 * @type {object}
                 * @param {number} absolute
                 */
                this.notify("absolute", { angle });
                break;
            default:
                super.receive(message);
                break;
        }
    }

    /**
     * Rotate a motor by a given angle.
     * @method AbsoluteMotor#gotoAngle
     * @param {number} angle Absolute position the motor should go to (degrees from 0).
     * @param {number} [speed=100] For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100.
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public gotoAngle (angle: [number, number] | number, speed: number = 100) {
        if (!this.isVirtualPort && angle instanceof Array) {
            throw new Error("Only virtual ports can accept multiple positions");
        }
        if (this.isWeDo2SmartHub) {
            throw new Error("Absolute positioning is not available on the WeDo 2.0 Smart Hub");
        }
        this.cancelEventTimer();
        return new Promise<void>((resolve) => {
            if (speed === undefined || speed === null) {
                speed = 100;
            }
            let message;
            if (angle instanceof Array) {
                message = Buffer.from([0x81, this.portId, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, mapSpeed(speed), this._maxPower, this._brakeStyle, this.useProfile()]);
                message.writeInt32LE(normalizeAngle(angle[0]), 4);
                message.writeInt32LE(normalizeAngle(angle[1]), 8);
            } else {
                message = Buffer.from([0x81, this.portId, 0x11, 0x0d, 0x00, 0x00, 0x00, 0x00, mapSpeed(speed), this._maxPower, this._brakeStyle, this.useProfile()]);
                message.writeInt32LE(normalizeAngle(angle), 4);
            }
            this.send(message);
            this._finishedCallbacks.push(() => {
                return resolve();
            });
        });
    }


    /**
     * Rotate motor to real zero position.
     *
     * Real zero is marked on Technic angular motors (SPIKE Prime). It is also available on Technic linear motors (Control+) but is unmarked.
     * @method AbsoluteMotor#gotoRealZero
     * @param {number} [speed=100] Speed between 1 - 100. Note that this will always take the shortest path to zero.
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public gotoRealZero (speed: number = 100) {
        return new Promise<void>((resolve) => {
            const oldMode = this.mode;
            let calibrated = false;
            this.on("absolute", async ({ angle }) => {
                if (!calibrated) {
                    calibrated = true;
                    if (angle < 0) {
                        angle = Math.abs(angle);
                    } else {
                        speed = -speed;
                    }
                    await this.rotateByDegrees(angle, speed);
                    if (oldMode) {
                        this.subscribe(oldMode);
                    }
                    return resolve();
                }
            });
            this.requestUpdate();
        });
    }


    /**
     * Reset zero to current position
     * @method AbsoluteMotor#resetZero
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public resetZero () {
        return new Promise<void>((resolve) => {
            const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x02, 0x00, 0x00, 0x00, 0x00]);
            this.send(data);
            return resolve();
        });
    }


}

export enum Mode {
    ROTATION = 0x02,
    ABSOLUTE = 0x03
}

export const ModeMap: {[event: string]: number} = {
    "rotate": Mode.ROTATION,
    "absolute": Mode.ABSOLUTE
};
