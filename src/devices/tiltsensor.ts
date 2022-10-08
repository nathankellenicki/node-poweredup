import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TiltSensor
 * @extends Device
 */
export class TiltSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.TILT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;
        let x = 0;
        let y = 0;
        let z = 0;

        switch (mode) {
            case Mode.TILT:
                if (message.length !== (this.isWeDo2SmartHub ? 4 : 6)) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                x = message.readInt8(this.isWeDo2SmartHub ? 2 : 4);
                y = message.readInt8(this.isWeDo2SmartHub ? 3 : 5);
                /**
                 * Emits when a tilt sensor is activated.
                 * @event TiltSensor#tilt
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 */
                this.notify("tilt", { x, y });
                break;
            case Mode.DIRECTION:
                const dir = message.readInt8(this.isWeDo2SmartHub ? 2 : 4);
                /**
                 * Emits when the tilt sensor direction changes.
                 * @event TiltSensor#direction
                 * @type {object}
                 * @param {TiltDirection} dir
                 */
                this.notify("direction", { dir });
                break;
            case Mode.CRASH:
                if (message.length !== (this.isWeDo2SmartHub ? 5 : 7)) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                x = message.readUInt8(this.isWeDo2SmartHub ? 2 : 4);
                y = message.readUInt8(this.isWeDo2SmartHub ? 3 : 5);
                z = message.readUInt8(this.isWeDo2SmartHub ? 4 : 6);
                /**
                 * Emits when proper acceleration is above threshold (e.g. on impact when being thrown to the ground).
                 * @event TiltSensor#impactCount
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                this.notify("impactCount", { x, y, z });
                break;
            case Mode.CAL:
                if (message.length !== (this.isWeDo2SmartHub ? 5 : 7)) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                const ax = message.readInt8(this.isWeDo2SmartHub ? 2 : 4)*Math.PI/180;
                const ay = message.readInt8(this.isWeDo2SmartHub ? 3 : 5)*Math.PI/180;
                const az = message.readInt8(this.isWeDo2SmartHub ? 4 : 6)*Math.PI/180;
                x = Math.round(1000*Math.sqrt(2)*Math.sin(ax)*Math.cos(ay)*Math.cos(az))
                y = Math.round(1000*Math.sqrt(2)*Math.cos(ax)*Math.sin(ay)*Math.cos(az))
                z = Math.round(1000*Math.sqrt(2)*Math.cos(ax)*Math.cos(ay)*Math.sin(az))
                /**
                 * Emits when tilt sensor detects acceleration. Measured in mG.
                 * @event TiltSensor#accel
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                this.notify("accel", { x, y, z });
                break;
        }
    }
}

export enum Mode {
    TILT = 0x00,
    DIRECTION = 0x01,
    CRASH = 0x02,
    CAL = 0x03
}

export const ModeMap: {[event: string]: number} = {
    "tilt": Mode.TILT,
    "direction": Mode.DIRECTION,
    "impactCount": Mode.CRASH,
    "accel": Mode.CAL
};
