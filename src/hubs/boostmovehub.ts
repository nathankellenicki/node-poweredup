import { Peripheral } from "@abandonware/noble";
import compareVersion from "compare-versions";

import { IBLEAbstraction } from "../interfaces";

import { LPF2Hub } from "./lpf2hub";

import * as Consts from "../consts";

import Debug = require("debug");
const debug = Debug("boostmovehub");


/**
 * The BoostMoveHub is emitted if the discovered device is a Boost Move Hub.
 * @class BoostMoveHub
 * @extends LPF2Hub
 * @extends Hub
 */
export class BoostMoveHub extends LPF2Hub {


    public static IsBoostMoveHub (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.BOOST_MOVE_HUB_ID
        );
    }

    protected _currentPort = 0x3b;
    protected _voltagePort = 0x3c;

    constructor (device: IBLEAbstraction) {
        super(device, BoostMoveHub.PortMap, Consts.HubType.BOOST_MOVE_HUB);
        debug("Discovered Boost Move Hub");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Boost Move Hub");
            await super.connect();
            debug("Connect completed");
            return resolve();
        });
    }


    protected _checkFirmware (version: string) {
        if (compareVersion("2.0.00.0017", version) === 1) {
            throw new Error(`Your Boost Move Hub's (${this.name}) firmware is out of date and unsupported by this library. Please update it via the official Powered Up app.`);
        }
    }


}

export namespace BoostMoveHub {

    export const PortMap: {[portName: string]: number} = {
        "A": 0,
        "B": 1,
        "C": 2,
        "D": 3,
        "TILT": 58
    }

}