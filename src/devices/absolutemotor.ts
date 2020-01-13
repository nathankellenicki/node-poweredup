import { TachoMotor } from "./tachomotor";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";
import { mapSpeed, normalizeAngle, roundAngleToNearest90 } from "../utils";

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
        return new Promise((resolve) => {
            this._busy = true;
            if (speed === undefined || speed === null) {
                speed = 100;
            }
            let message;
            if (angle instanceof Array) {
                message = Buffer.from([0x81, this.portId, 0x11, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, mapSpeed(speed), 0x64, 0x7e, 0x00]);
                message.writeInt32LE(normalizeAngle(angle[0]), 4);
                message.writeInt32LE(normalizeAngle(angle[1]), 8);
            } else {
                message = Buffer.from([0x81, this.portId, 0x11, 0x0d, 0x00, 0x00, 0x00, 0x00, mapSpeed(speed), 0x64, 0x7e, 0x00]);
                message.writeInt32LE(normalizeAngle(angle), 4);
            }
            this.send(message);
            this._finished = () => {
                return resolve();
            };
        });
    }

    /**
     * (Re)set the knowledge of the absolute position to the current angle.
     * @method AbsoluteMotor#resetAngle
     * @param {number} angle Position to set (degrees from 0).
     * @returns {Promise} Resolved upon successful completion of command (ie. once the motor is finished).
     */
    public resetAngle (angle: [number, number] | number) {
        if (!this.isVirtualPort && angle instanceof Array) {
            throw new Error("Only virtual ports can accept multiple positions");
        }
        if (this.isWeDo2SmartHub) {
            throw new Error("Absolute positioning is not available on the WeDo 2.0 Smart Hub");
        }
        this.cancelEventTimer();
        return new Promise((resolve) => {
            this._busy = true;
            let message;
            if (angle instanceof Array) {
                message = Buffer.from([0x81, this.portId, 0x11, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                message.writeInt32LE(normalizeAngle(angle[0]), 4);
                message.writeInt32LE(normalizeAngle(angle[1]), 8);
            } else {
                message = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x02, 0x00, 0x00, 0x00, 0x00]);
                message.writeInt32LE(normalizeAngle(angle), 5);
            }
            this.send(message);
            this._finished = () => {
                return resolve();
            };
        });
    }

    public async calibrateServo () {
        this.cancelEventTimer();
        const oldMode = this.mode;
        let currentAngle = 0;
        const listener = ({ angle }: { angle: number }) => {
            currentAngle = angle;
        };
        this.on("absolute", listener);
        await this.resetAngle(0);
        await this.stop();
        this.gotoAngle(0, 50);
        await this.hub.sleep(600);
        await this.stop();
        await this.hub.sleep(500);
        const absPositionAt0 = currentAngle;
        this.gotoAngle(-160, 60);
        await this.hub.sleep(600);
        await this.stop();
        await this.hub.sleep(500);
        const absPositionAtMin160 = currentAngle;
        this.gotoAngle(160, 60);
        await this.hub.sleep(600);
        await this.stop();
        await this.hub.sleep(500);
        const absPositionAt160 = currentAngle;
        const midPoint1 = normalizeAngle((absPositionAtMin160 + absPositionAt160) / 2);
        const midPoint2 = normalizeAngle(midPoint1 + 180);
        const baseAngle = (Math.abs(normalizeAngle(midPoint1 - absPositionAt0)) < Math.abs(normalizeAngle(midPoint2 - absPositionAt0))) ?
            roundAngleToNearest90(midPoint1) :
            roundAngleToNearest90(midPoint2);
        const resetToAngle = normalizeAngle(currentAngle - baseAngle);
        await this.resetAngle(0);
        await this.stop();
        this.gotoAngle(0, 40);
        await this.hub.sleep(50);
        await this.stop();
        await this.resetAngle(resetToAngle);
        this.gotoAngle(0, 40);
        await this.hub.sleep(600);
        await this.stop();
        this.removeListener("absolute", listener);
        if (oldMode !== undefined) {
            this.subscribe(oldMode);
        }
    }

    public async resetServo (angle: number) {
        this.cancelEventTimer();
        const oldMode = this.mode;
        let currentAngle = 0;
        const listener = ({ angle }: { angle: number }) => {
            currentAngle = angle;
        };
        this.on("absolute", listener);
        angle = Math.max(-180, Math.min(179, angle));
        const resetToAngle = normalizeAngle(currentAngle - angle);
        await this.resetAngle(0);
        await this.stop();
        this.gotoAngle(0, 40);
        await this.hub.sleep(50);
        await this.stop();
        await this.resetAngle(resetToAngle);
        this.gotoAngle(0, 40);
        await this.hub.sleep(500);
        const diff = Math.abs(normalizeAngle(currentAngle - angle));
        if (diff > 5) {
            await this.resetAngle(0);
            await this.stop();
            this.gotoAngle(0, 40);
            await this.hub.sleep(50);
            await this.stop();
        }
        this.removeListener("absolute", listener);
        if (oldMode !== undefined) {
            this.subscribe(oldMode);
        }
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
