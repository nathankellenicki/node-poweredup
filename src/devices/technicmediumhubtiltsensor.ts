import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicMediumHubTiltSensor
 * @extends Device
 */
export class TechnicMediumHubTiltSensor extends Device {

    protected _impactThreshold: number = 10; // guess of default value
    protected _impactHoldoff: number = 10; // guess of default value

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.TILT:
                /**
                 * Emits when a tilt sensor is activated.
                 *
                 * @event TechnicMediumHubTiltSensor#tilt
                 * @type {object}
                 * @param {number} x
                 * @param {number} y
                 * @param {number} z
                 */
                let z = -message.readInt16LE(4);
                const y = message.readInt16LE(6);
                const x = message.readInt16LE(8);

                // workaround for calibration problem or bug in technicMediumHub firmware 1.1.00.0000
                if(y === 90 || y === -90) {
                    z = Math.sign(y)*(z + 180);
                    if(z > 180) z -= 360;
                    if(z < -180) z += 360;
                }

                this.notify("tilt", { x, y, z });
                break;

            case Mode.IMPACT_COUNT:
                if (message.length !== 8) {
                    // if mode of device has not changed to this._mode yet
                    break;
                }
                const count = message.readUInt32LE(4);
                /**
                 * Emits when proper acceleration is above threshold (e.g. on impact when being thrown to the ground).
                 * @event TechnicMediumHubTiltSensor#impactCount
                 * @type {object}
                 * @param {number} number of impact events.
                 */
                this.notify("tiltCount", { count });
                break;
        }
    }

    /**
     * Set the impact count value.
     * @method TechnicMediumHubTiltSensor#setImpactCount
     * @param {count} impact count between 0 and 2^32
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setImpactCount (count: number) {
        return new Promise<void>((resolve) => {
            const payload = Buffer.alloc(4);
	    payload.writeUInt32LE(count % 2**32);
            // no need to subscribe, can be set in different mode
            this.writeDirect(0x01, payload);
            return resolve();
        });
    }

    /**
     * Set the impact threshold.
     * @method TechnicMediumHubTiltSensor#setImpactThreshold
     * @param {threshold} value between 1 and 127
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setImpactThreshold (threshold: number) {
        this._impactThreshold = threshold;
        return new Promise<void>((resolve) => {
            this.writeDirect(0x02, Buffer.from([this._impactThreshold, this._impactHoldoff]));
            return resolve();
        });
    }

    /**
     * Set the impact holdoff time.
     * @method TechnicMediumHubTiltSensor#setImpactHoldoff
     * @param {holdoff} value between 1 and 127
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setImpactHoldoff (holdoff: number) {
        this._impactHoldoff = holdoff;
        return new Promise<void>((resolve) => {
            this.writeDirect(0x02, Buffer.from([this._impactThreshold, this._impactHoldoff]));
            return resolve();
        });
    }
}

export enum Mode {
    TILT = 0x00,
    IMPACT_COUNT = 0x01
}

export const ModeMap: {[event: string]: number} = {
    "tilt": Mode.TILT,
    "impactCount": Mode.IMPACT_COUNT
};
