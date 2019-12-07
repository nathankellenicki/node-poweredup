import { Peripheral } from "@abandonware/noble";
import compareVersion from "compare-versions";

import { LPF2Hub } from "./lpf2hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
import { IBLEAbstraction } from "./interfaces";
const debug = Debug("puphub");


/**
 * The PUPHub is emitted if the discovered device is a Powered UP Hub.
 * @class PUPHub
 * @extends LPF2Hub
 * @extends Hub
 */
export class PUPHub extends LPF2Hub {


    public static IsPUPHub (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.POWERED_UP_HUB_ID
        );
    }

    protected _currentPort = 0x3b;
    protected _voltagePort = 0x3c;

    constructor (device: IBLEAbstraction, autoSubscribe: boolean = true) {
        super(device, autoSubscribe);
        this._type = Consts.HubType.POWERED_UP_HUB;
        this._portNames = {
            "A": 0,
            "B": 1
        };
        debug("Discovered Powered UP Hub");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Powered UP Hub");
            await super.connect();
            debug("Connect completed");
            return resolve();
        });
    }


    protected _checkFirmware (version: string) {
        if (compareVersion("1.1.00.0004", version) === 1) {
            throw new Error(`Your Powered Up Hub's (${this.name}) firmware is out of date and unsupported by this library. Please update it via the official Powered Up app.`);
        }
    }


}
