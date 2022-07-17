import { Peripheral } from "@abandonware/noble";
import compareVersion from "compare-versions";

import { IBLEAbstraction } from "../interfaces";

import { LPF2Hub } from "./lpf2hub";

import * as Consts from "../consts";

import Debug = require("debug");
const debug = Debug("hub");


/**
 * The Hub is emitted if the discovered device is a Hub.
 * @class Hub
 * @extends LPF2Hub
 * @extends BaseHub
 */
export class Hub extends LPF2Hub {


    public static IsHub (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.HUB_ID
        );
    }

    protected _currentPort = 0x3b;

    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.HUB);
        debug("Discovered Powered UP Hub");
    }


    public async connect () {
        debug("Connecting to Powered UP Hub");
        await super.connect();
        debug("Connect completed");
    }


    protected _checkFirmware (version: string) {
        if (compareVersion("1.1.00.0004", version) === 1) {
            throw new Error(`Your Powered Up Hub's (${this.name}) firmware is out of date and unsupported by this library. Please update it via the official Powered Up app.`);
        }
    }


}

export const PortMap: {[portName: string]: number} = {
    "A": 0,
    "B": 1,
    "HUB_LED": 50,
    "CURRENT_SENSOR": 59,
    "VOLTAGE_SENSOR": 60
};
