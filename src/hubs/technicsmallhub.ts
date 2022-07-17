import { Peripheral } from "@abandonware/noble";
import compareVersion from "compare-versions";

import { IBLEAbstraction } from "../interfaces";

import { LPF2Hub } from "./lpf2hub";

import * as Consts from "../consts";

import Debug = require("debug");
const debug = Debug("hub");


/**
 * The TechnicSmallHub is emitted if the discovered device is a Technic Small Hub.
 * @class Hub
 * @extends LPF2Hub
 * @extends BaseHub
 */
export class TechnicSmallHub extends LPF2Hub {


    public static IsTechnicSmallHub (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.TECHNIC_SMALL_HUB_ID
        );
    }

    protected _currentPort = 0x3b;

    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.TECHNIC_SMALL_HUB);
        debug("Discovered Spike Essential Hub");
    }


    public async connect () {
        debug("Connecting to Spike Essential Hub");
        await super.connect();
        debug("Connect completed");
    }


}

export const PortMap: {[portName: string]: number} = {
    "A": 0,
    "B": 1,
    "HUB_LED": 49,
    "CURRENT_SENSOR": 59,
    "VOLTAGE_SENSOR": 60,
    "ACCELEROMETER": 97,
    "GYRO_SENSOR": 98,
    "TILT_SENSOR": 99
};
