import { Peripheral } from "@stoprocent/noble";

import { IBLEAbstraction } from "../interfaces.js";

import { LPF2Hub } from "./lpf2hub.js";

import * as Consts from "../consts.js";

import Debug from "debug";
const debug = Debug("movehub");


/**
 * Luigi is emitted if the discovered device is a LEGO Luigi interactive brick.
 * Behaviour matches the Super Mario hub.
 * @class Luigi
 * @extends LPF2Hub
 * @extends BaseHub
 */
export class Luigi extends LPF2Hub {

    public static IsLuigi (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.LUIGI_ID
        );
    }

    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.LUIGI);
        debug("Discovered Luigi");
    }


    public async connect () {
        debug("Connecting to Luigi");
        await super.connect();
        debug("Connect completed");
    }

}

export const PortMap: {[portName: string]: number} = {
};
