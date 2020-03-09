import { Peripheral } from "@abandonware/noble";

import { IBLEAbstraction } from "../interfaces";

import { LPF2Hub } from "./lpf2hub";

import * as Consts from "../consts";

import Debug = require("debug");
const debug = Debug("remotecontrol");


/**
 * The RemoteControl is emitted if the discovered device is a Remote Control.
 * @class RemoteControl
 * @extends LPF2Hub
 * @extends BaseHub
 */
export class RemoteControl extends LPF2Hub {


    public static IsRemoteControl (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.REMOTE_CONTROL_ID
        );
    }


    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.REMOTE_CONTROL);
        debug("Discovered Powered UP Remote");
    }


    public async connect () {
        debug("Connecting to Powered UP Remote");
        await super.connect();
        debug("Connect completed");
    }


}

export const PortMap: {[portName: string]: number} = {
    "LEFT": 0,
    "RIGHT": 1,
    "HUB_LED": 52,
    "VOLTAGE_SENSOR": 59,
    "REMOTE_CONTROL_RSSI": 60
};
