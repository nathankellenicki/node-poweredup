import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class TechnicDistanceSensor
 * @extends Device
 */
export class TechnicDistanceSensor extends Device {

    public static Mode = {
        DISTANCE: 0x00,
        FAST_DISTANCE: 0x01
    }

    public static ModeMap: {[event: string]: number} = {
        "distance": TechnicDistanceSensor.Mode.DISTANCE,
        "fastDistance": TechnicDistanceSensor.Mode.FAST_DISTANCE
    };

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, TechnicDistanceSensor.ModeMap, {}, Consts.DeviceType.TECHNIC_DISTANCE_SENSOR);
    }

    public parse (mode: number, message: Buffer) {

        switch (mode) {
            case TechnicDistanceSensor.Mode.DISTANCE:
                const distance = message.readUInt16LE(4);

                /**
                 * Emits when the detected distance changes (Slow sampling covers 40mm to 2500mm).
                 * @event TechnicDistanceSensor#distance
                 * @type {object}
                 * @param {number} distance Distance, from 40 to 2500mm
                 */
                this.notify("distance", { distance });
                return message.slice(2);

            case TechnicDistanceSensor.Mode.FAST_DISTANCE:
                const fastDistance = message.readUInt16LE(4);

                /**
                 * Emits when the detected distance changes (Fast sampling covers 50mm to 320mm).
                 * @event TechnicDistanceSensor#fastDistance
                 * @type {object}
                 * @param {number} fastDistance Distance, from 50 to 320mm
                 */
                this.notify("fastDistance", { fastDistance });
                return message.slice(2);
        }

        return message;
    }

    /**
     * Set the brightness (or turn on/off) the lights around the eyes.
     * @method TechnicDistanceSensor#setBrightness
     * @param {number} topLeft Top left quadrant (above left eye). 0-100 brightness.
     * @param {number} bottomLeft Bottom left quadrant (below left eye). 0-100 brightness.
     * @param {number} topRight Top right quadrant (above right eye). 0-100 brightness.
     * @param {number} bottomRight Bottom right quadrant (below right eye). 0-100 brightness.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setBrightness (topLeft: number, bottomLeft: number, topRight: number, bottomRight: number) {
        this.writeDirect(0x05, Buffer.from([topLeft, topRight, bottomLeft, bottomRight]));
    }

}
