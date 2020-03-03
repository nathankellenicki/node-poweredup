import { Peripheral } from "@abandonware/noble";

import { LPF2Hub } from "./lpf2hub";

import * as Consts from "../consts";

import Debug = require("debug");
import { IBLEAbstraction } from "../interfaces";
const debug = Debug("duplotrainbase");


/**
 * The DuploTrainBase is emitted if the discovered device is a Duplo Train Base.
 * @class DuploTrainBase
 * @extends LPF2Hub
 * @extends BaseHub
 */
export class DuploTrainBase extends LPF2Hub {


    public static IsDuploTrainBase (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.DUPLO_TRAIN_BASE_ID
        );
    }


    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.DUPLO_TRAIN_BASE);
        debug("Discovered Duplo Train Base");
    }


    public async connect () {
        debug("Connecting to Duplo Train Base");
        await super.connect();
        debug("Connect completed");
    }


}

export const PortMap: {[portName: string]: number} = {
    "MOTOR": 0,
    "COLOR": 18,
    "SPEEDOMETER": 19
};

