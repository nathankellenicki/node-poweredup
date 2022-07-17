import { Peripheral } from "@abandonware/noble";
import compareVersion from "compare-versions";

import { IBLEAbstraction } from "../interfaces";

import { LPF2Hub } from "./lpf2hub";

import * as Consts from "../consts";

import Debug = require("debug");
const debug = Debug("movehub");


/**
 * Mario is emitted if the discovered device is a LEGO Super Mario brick.
 * @class Mario
 * @extends LPF2Hub
 * @extends BaseHub
 */
export class Mario extends LPF2Hub {


    public static IsMario (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.MARIO_ID
        );
    }

    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.MARIO);
        debug("Discovered Mario");
    }


    public async connect () {
        debug("Connecting to Mario");
        await super.connect();
        debug("Connect completed");
    }


}

export const PortMap: {[portName: string]: number} = {
};
