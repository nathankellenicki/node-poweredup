import { Peripheral } from "@abandonware/noble";
import { compile } from "@pybricks/mpy-cross-v6";
import { IBLEAbstraction } from "../interfaces";
import { BaseHub } from "./basehub";
import * as Consts from "../consts";
import Debug = require("debug");
const debug = Debug("pybrickshub");


/**
 * The PybricksHub is emitted if the discovered device is hub with pybricks firmware.
 * @class PybricksHub
 * @extends BaseHub
 */
export class PybricksHub extends BaseHub {
    private _checkSumCallback: ((buffer: Buffer) => any) | undefined;

    public static IsPybricksHub (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.PYBRICKS_HUB.replace(/-/g, "")) >= 0
        );
    }


    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.PYBRICKS_HUB);
        debug("Discovered Pybricks Hub");
    }


    public connect () {
        return new Promise<void>(async (resolve) => {
            debug("Connecting to Pybricks Hub");
            await super.connect();
            await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.PYBRICKS_HUB);
            await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.PYBRICKS_NUS);
            debug("Connect completed");
            this.emit("connect");
            resolve();
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.PYBRICKS_NUS_TX, this._parseMessage.bind(this));
        });
    }

    private _parseMessage (data?: Buffer) {
        debug("Received Message (PYBRICKS_NUS_TX)", data);
        if(this._checkSumCallback && data) {
            return this._checkSumCallback(data);
        }
        this.emit("recieve", data);
    }

    public send (message: Buffer, uuid: string = Consts.BLECharacteristic.PYBRICKS_NUS_RX) {
        debug(`Send Message (${uuid})`,  message);
        return this._bleDevice.writeToCharacteristic(uuid, message);
    }

    public startUserProgram (pythonCode: string) {
        debug("Compiling Python User Program", pythonCode);
        return compile("UserProgram.py", pythonCode).then(async (result) => {
            if(result.mpy) {
                debug("Uploading Python User Program", result.mpy);
                const programLength = Buffer.alloc(4);
                programLength.writeUint32LE(result.mpy.byteLength);
                const checkSumPromise = new Promise<boolean>((resolve) => {
                    const checkSum = programLength.reduce((a, b) => a ^ b);
                    this._checkSumCallback = (data) => resolve(data[0] === checkSum);
                });
                this.send(programLength, Consts.BLECharacteristic.PYBRICKS_NUS_RX);
                await checkSumPromise;
                const chunkSize = 100;
                for (let i = 0; i < result.mpy.byteLength; i += chunkSize) {
                    const chunk = result.mpy.slice(i, i + chunkSize);
                    const checkSumPromise = new Promise<boolean>((resolve) => {
                        const checkSum = chunk.reduce((a, b) => a ^ b);
                        this._checkSumCallback = (data) => resolve(data[0] === checkSum);
                    });
                    this.send(Buffer.from(chunk), Consts.BLECharacteristic.PYBRICKS_NUS_RX);
                    await checkSumPromise;
                }
                this._checkSumCallback = undefined;
                debug("Finished uploading");
            }
            else throw new Error(`Compiling Python User Program failed: ${result.err}`);
        });
    }

    public stopUserProgram () {
        return this.send(Buffer.from([0]), Consts.BLECharacteristic.PYBRICKS_CONTROL);
    }
}

export const PortMap: {[portName: string]: number} = {
};
