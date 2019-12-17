import { Peripheral } from "@abandonware/noble";

import { LPF2Hub } from "./lpf2hub";

import * as Consts from "./consts";

import Debug = require("debug");
import { IBLEAbstraction } from "./interfaces";
const debug = Debug("duplotrainbase");


/**
 * The DuploTrainBase is emitted if the discovered device is a Duplo Train Base.
 * @class DuploTrainBase
 * @extends LPF2Hub
 * @extends Hub
 */
export class DuploTrainBase extends LPF2Hub {


    public static IsDuploTrainBase (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.LPF2_HUB.replace(/-/g, "")) >= 0 &&
            peripheral.advertisement.manufacturerData &&
            peripheral.advertisement.manufacturerData.length > 3 &&
            peripheral.advertisement.manufacturerData[3] === Consts.BLEManufacturerData.DUPLO_TRAIN_HUB_ID
        );
    }


    protected _ledPort = 0x11;
    protected _voltagePort = 0x14;
    protected _voltageMaxV = 6.4;
    protected _voltageMaxRaw = 3047;

    constructor (device: IBLEAbstraction) {
        super(device, Consts.HubType.DUPLO_TRAIN_HUB);
        this._portNames = {
            "MOTOR": 0,
            "COLOR": 18,
            "SPEEDOMETER": 19
        };
        debug("Discovered Duplo Train Base");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
            debug("Connecting to Duplo Train Base");
            await super.connect();
            // this.subscribe(0x01, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEAKER, 0x01);
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Play a built-in train sound.
     * @method DuploTrainBase#playSound
     * @param {DuploTrainBaseSound} sound
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public playSound (sound: number) {
        return new Promise((resolve, reject) => {
            const data = Buffer.from([0x81, 0x01, 0x11, 0x51, 0x01, sound]);
            this.send(data, Consts.BLECharacteristic.LPF2_ALL);
            return resolve();
        });
    }


}
