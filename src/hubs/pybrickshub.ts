import { Peripheral } from "@abandonware/noble";
import { compile } from "@pybricks/mpy-cross-v6";
import { IBLEAbstraction } from "../interfaces";
import { BaseHub } from "./basehub";
import * as Consts from "../consts";
import Debug = require("debug");
const debug = Debug("pybrickshub");


/**
 * The PybricksHub is emitted if the discovered device is a hub with Pybricks firmware installed.
 * To flash your hub with Pybricks firmware, follow the instructions from https://pybricks.com.
 * The class supports hubs with Pybricks version 3.2.0 or newer.
 * @class PybricksHub
 * @extends BaseHub
 */
export class PybricksHub extends BaseHub {
    private _maxCharSize: number = 100; // overwritten by value from capabilities characteristic
    private _maxUserProgramSize: number = 16000; // overwritten by value from capabilities characteristic

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
            await this._bleDevice.readFromCharacteristic(Consts.BLECharacteristic.PYBRICKS_CAPABILITIES, (err, data) => {
              if (data) {
                this._maxCharSize = data.readUInt16LE(0);
                this._maxUserProgramSize = data.readUInt32LE(6);
                debug("Recieved capabilities ", data, " maxCharSize: ", this._maxCharSize, " maxUserProgramSize: ", this._maxUserProgramSize);
              }
            });
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.PYBRICKS_NUS_TX, this._parseMessage.bind(this));
            debug("Connect completed");
            this.emit("connect");
            resolve();
        });
    }

    private _parseMessage (data?: Buffer) {
        debug("Received Message (PYBRICKS_NUS_TX)", data);
        this.emit("recieve", data);
    }

    public send (message: Buffer, uuid: string = Consts.BLECharacteristic.PYBRICKS_NUS_RX) {
        debug(`Send Message (${uuid})`,  message);
        return this._bleDevice.writeToCharacteristic(uuid, message);
    }

    public uploadUserProgram (pythonCode: string) {
        debug("Compiling Python User Program", pythonCode);
        return compile('userProgram.py', pythonCode).then(async (result) => {
            if(result.mpy) {
                const multiFileBlob = Buffer.concat([Buffer.from([0, 0, 0, 0]), Buffer.from('__main__\0'), result.mpy]);
                multiFileBlob.writeUInt32LE(result.mpy.length);
                if(multiFileBlob.length > this._maxUserProgramSize) {
                  throw new Error(`User program size ${multiFileBlob.length} larger than maximum ${this._maxUserProgramSize}`);
                }
                debug("Uploading Python User Program", multiFileBlob);
                await this.writeUserProgramMeta(0);
                const chunkSize = this._maxCharSize - 5;
                for (let i = 0; i < multiFileBlob.length; i += chunkSize) {
                    const chunk = multiFileBlob.slice(i, i + chunkSize);
                    await this.writeUserRam(i, Buffer.from(chunk));
                }
                await this.writeUserProgramMeta(multiFileBlob.length);
                debug("Finished uploading");
            }
            else throw new Error(`Compiling Python User Program failed: ${result.err}`);
        });
    }

    public stopUserProgram () {
        debug("Stopping Python User Program");
        return this.send(Buffer.from([0]), Consts.BLECharacteristic.PYBRICKS_COMMAND_EVENT);
    }

    public startUserProgram () {
        debug("Starting Python User Program");
        return this.send(Buffer.from([1]), Consts.BLECharacteristic.PYBRICKS_COMMAND_EVENT);
    }

    private writeUserProgramMeta (programLength: number) {
        const message = Buffer.alloc(5);
        message[0] = 3;
        message.writeUInt32LE(programLength, 1);
        return this.send(message, Consts.BLECharacteristic.PYBRICKS_COMMAND_EVENT);
    }

    private writeUserRam (offset: number, payload: Buffer) {
        const message = Buffer.concat([Buffer.from([4, 0, 0, 0, 0]), payload]);
        message.writeUInt32LE(offset, 1);
        return this.send(message, Consts.BLECharacteristic.PYBRICKS_COMMAND_EVENT);
    }
}

export const PortMap: {[portName: string]: number} = {
};
