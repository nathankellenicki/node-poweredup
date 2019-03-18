import { Peripheral } from "noble";

import { LPF2Hub } from "./lpf2hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
import { IBLEDevice } from "./interfaces";
const debug = Debug("pupremote");


/**
 * The PUPRemote is emitted if the discovered device is a Powered UP Remote.
 * @class PUPRemote
 * @extends LPF2Hub
 * @extends Hub
 */
export class PUPRemote extends LPF2Hub {


    // We set JSDoc to ignore these events as a Powered UP Remote will never emit them.

    /**
     * @event PUPRemote#distance
     * @ignore
     */

    /**
     * @event PUPRemote#color
     * @ignore
     */

    /**
     * @event PUPRemote#tilt
     * @ignore
     */

    /**
     * @event PUPRemote#rotate
     * @ignore
     */

    /**
     * @event PUPRemote#speed
     * @ignore
     */

    /**
     * @event PUPRemote#attach
     * @ignore
     */

    /**
     * @event PUPRemote#detach
     * @ignore
     */


    public static IsPUPRemote (peripheral: Peripheral) {
        return (peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 && peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.POWERED_UP_REMOTE_ID);
    }


    constructor (device: IBLEDevice, autoSubscribe: boolean = true) {
        super(device, autoSubscribe);
        this.type = Consts.HubType.POWERED_UP_REMOTE;
        this._ports = {
            "LEFT": new Port("LEFT", 0),
            "RIGHT": new Port("RIGHT", 1)
        };
        debug("Discovered Powered UP Remote");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Powered UP Remote");
            await super.connect();
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Remote via a color value.
     * @method PUPRemote#setLEDColor
     * @param {Color} color
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x41, 0x34, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            if (color === false) {
                color = 0;
            }
            data = Buffer.from([0x81, 0x34, 0x11, 0x51, 0x00, color]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via RGB values.
     * @method PUPRemote#setLEDRGB
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDRGB (red: number, green: number, blue: number) {
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x41, 0x34, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            data = Buffer.from([0x81, 0x34, 0x11, 0x51, 0x01, red, green, blue]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            return resolve();
        });
    }


}
