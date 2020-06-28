import { Device } from "./device";

import { IDeviceInterface, IEventData } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class ColorDistanceSensor
 * @extends Device
 */
export class ColorDistanceSensor extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        const modes = [
            {
                name: "color", // COLOR
                input: true,
                output: false,
                raw: { min: 0, max: 10 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 10, symbol: "IDX" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "distance", // PROX
                input: true,
                output: false,
                raw: { min: 0, max: 10 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 10, symbol: "DIS" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "COUNT",
                input: false,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "CNT" },
                values: { count: 1, type: Consts.ValueType.Int32 }
            },
            {
                name: "REFLT",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "PCT" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "AMBI",
                input: true,
                output: false,
                raw: { min: 0, max: 100 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 100, symbol: "PCT" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "COL O",
                input: false,
                output: true,
                raw: { min: 0, max: 10 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 10, symbol: "IDX" },
                values: { count: 1, type: Consts.ValueType.Int8 }
            },
            {
                name: "RGB I",
                input: true,
                output: false,
                raw: { min: 0, max: 1023 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 1023, symbol: "RAW" },
                values: { count: 3, type: Consts.ValueType.Int16 }
            },
            {
                name: "IR Tx",
                input: false,
                output: true,
                raw: { min: 0, max: 65535 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 65535, symbol: "N/A" },
                values: { count: 1, type: Consts.ValueType.Int16 }
            },
            {
                name: "colorAndDistance", // SPEC 1
                input: true,
                output: false,
                raw: { min: 0, max: 255 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 255, symbol: "N/A" },
                values: { count: 4, type: Consts.ValueType.Int8 }
            },
            {
                name: "DEBUG",
                input: true,
                output: false,
                raw: { min: 0, max: 1023 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 10, symbol: "N/A" },
                values: { count: 2, type: Consts.ValueType.Int16 }
            },
            {
                name: "CALIB",
                input: true,
                output: false,
                raw: { min: 0, max: 65535 },
                pct: { min: 0, max: 100 },
                si: { min: 0, max: 65535, symbol: "N/A" },
                values: { count: 8, type: Consts.ValueType.Int16 }
            }
        ];
        super(hub, portId, modes, Consts.DeviceType.COLOR_DISTANCE_SENSOR);


        this._eventHandlers.color = (data: IEventData) => {
            const [color] = data.raw;
            /**
             * Emits when a color sensor is activated.
             * @event ColorDistanceSensor#color
             * @type {object}
             * @param {Color} color
             */
            this.notify("color", { color });
        };
        this._eventHandlers.distance = (data: IEventData) => {
            const distance = data.si[0] * 25.4;
            /**
             * Emits when a distance sensor is activated.
             * @event ColorDistanceSensor#distance
             * @type {object}
             * @param {number} distance Distance, in millimeters.
             */
            this.notify("distance", { distance });
        };
        this._eventHandlers.colorAndDistance = (data: IEventData) => {
            const [color, proximity, ledColor, reflectivity] = data.raw

            let distance = proximity;
            if (reflectivity > 0) {
                distance += 1.0 / reflectivity;
            }
            distance = Math.floor(distance * 25.4) - 20;

            /**
             * A combined color and distance event, emits when the sensor is activated.
             * @event ColorDistanceSensor#colorAndDistance
             * @type {object}
             * @param {Color} color
             * @param {number} distance Distance, in millimeters.
             */
            this.notify("colorAndDistance", { color, distance });
        };
    }

    /**
     * Switches the IR receiver into extended channel mode. After setting this, use channels 5-8 instead of 1-4 for this receiver.
     *
     * NOTE: Calling this with channel 5-8 with switch off extended channel mode for this receiver.
     * @method ColorDistanceSensor#setPFExtendedChannel
     * @param {number} channel Channel number, between 1-8
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setPFExtendedChannel (channel: number) {
        let address = 0;
        if (channel >= 4) {
            channel -= 4;
            address = 1;
        }
        const message = Buffer.alloc(2);
        // Send "Extended toggle address command"
        message[0] = ((channel - 1) << 4) + (address << 3);
        message[1] = 6 << 4;
        return this.sendPFIRMessage(message);
    }


    /**
     * Set the power of a Power Functions motor via IR
     * @method ColorDistanceSensor#setPFPower
     * @param {number} channel Channel number, between 1-4
     * @param {string} output Outport port, "RED" (A) or "BLUE" (B)
     * @param {number} power -7 (full reverse) to 7 (full forward). 0 is stop. 8 is brake.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setPFPower (channel: number, output: Output, power: number) {
        let address = 0;
        if (channel > 4) {
            channel -= 4;
            address = 1;
        }
        const message = Buffer.alloc(2);
        // Send "Single output mode"
        message[0] = ((channel - 1) << 4) + (address << 3) + (output === "RED" ? 4 : 5);
        message[1] = this._pfPowerToPWM(power) << 4;
        return this.sendPFIRMessage(message);
    }


    /**
     * Start Power Functions motors running via IR
     *
     * NOTE: This command is designed for bang-bang style operation. To keep the motors running, the sensor needs to be within range of the IR receiver constantly.
     * @method ColorDistanceSensor#startPFMotors
     * @param {Buffer} channel Channel number, between 1-4
     * @param {Buffer} powerA -7 (full reverse) to 7 (full forward). 0 is stop. 8 is brake.
     * @param {Buffer} powerB -7 (full reverse) to 7 (full forward). 0 is stop. 8 is brake.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public startPFMotors (channel: number, powerBlue: number, powerRed: number) {
        let address = 0;
        if (channel > 4) {
            channel -= 4;
            address = 1;
        }
        const message = Buffer.alloc(2);
        // Send "Combo PWM mode"
        message[0] = (((channel - 1) + 4 + (address << 3)) << 4) + this._pfPowerToPWM(powerBlue);
        message[1] = this._pfPowerToPWM(powerRed) << 4;
        return this.sendPFIRMessage(message);
    }


    /**
     * Send a raw Power Functions IR command
     * @method ColorDistanceSensor#sendPFIRMessage
     * @param {Buffer} message 2 byte payload making up a Power Functions protocol command. NOTE: Only specify nibbles 1-3, nibble 4 should be zeroed.
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public sendPFIRMessage (message: Buffer) {
        if (this.isWeDo2SmartHub) {
            throw new Error("Power Functions IR is not available on the WeDo 2.0 Smart Hub");
        } else {
            const payload = Buffer.alloc(2);
            payload[0] = (message[0] << 4) + (message[1] >> 4);
            payload[1] = message[0] >> 4;
            this.subscribe(this._modeMap["IR Tx"]);
            return this.writeDirect(0x07, payload);
        }
    }


    /**
     * Set the color of the LED on the sensor via a color value.
     * @method ColorDistanceSensor#setColor
     * @param {Color} color
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public setColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            if (color === false) {
                color = 0;
            }
            if (this.isWeDo2SmartHub) {
                throw new Error("Setting LED color is not available on the WeDo 2.0 Smart Hub");
            } else {
                this.subscribe(this._modeMap['COL O']);
                this.writeDirect(0x05, Buffer.from([color]));
            }
            return resolve();
        });
    }


    private _pfPowerToPWM (power: number) {
        return power & 15;
    }


}

export enum Output {
    RED = "RED",
    BLUE = "BLUE"
}
