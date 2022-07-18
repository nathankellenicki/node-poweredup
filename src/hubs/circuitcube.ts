import { Peripheral } from "@abandonware/noble";

import { IBLEAbstraction } from "../interfaces";

import { BaseHub } from "./basehub";

import * as Consts from "../consts";

import Debug = require("debug");
const debug = Debug("hub");

/**
 * The Hub is emitted if the discovered device is a Hub.
 * @class CircuitCube
 * @extends BaseHub
 */
export class CircuitCube extends BaseHub {
    private _timer: NodeJS.Timeout | undefined;

    public static IsCircuitCube (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.CIRCUIT_CUBE_1.replace(/-/g, "")) >= 0
        );
    }

    protected _currentPort = 0x3b;

    constructor (bleDevice: IBLEAbstraction) {
        super(bleDevice, {}, Consts.HubType.CIRCUIT_CUBE);
        debug("Discovered Circuit Cube");
    }

    public async connect () {
        debug("Connecting to Powered UP Hub");

        await super.connect();

        await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.CIRCUIT_CUBE_1);
        await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.CIRCUIT_CUBE_2);
        this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.CIRCUITCUBE_1_NOTIFY, this._parseMessage.bind(this));

        const setupTimeout = (ms: number) => {
            this._timer = setTimeout(async () => {
                await this.getVoltage();
                setupTimeout(10_000);
            }, ms);
        }

        setupTimeout(1_000);

        debug("Connect completed");
    }

    public disconnect()  {
        if(this._timer) {
            clearTimeout(this._timer);
        } 

        return super.disconnect();
    }
  
    private _parseMessage (data?: Buffer) {
        // console.log('message', data, data?.toString('ascii'));
        if(!data) {
            return;
        }

        if(data.byteLength === 1 ) {
            // "n?" should return a single byte 00 (success) or 01 (error)
            // "0" seems to also return a single byte 00
            if(data.readInt8() === 0) {
                this.getName();
            }
        } else if(data.byteLength === 4) {
            const level = Number(data.toString('utf-8'));
            if(!isNaN(level)) {
                this._batteryLevel = level;
            }
        } else {
            // should be the device name
            this._name = data.toString('ascii');
        }
    }

    public async setPower( levels: [number| undefined, number|undefined, number|undefined]) {
        const msg = levels.map((level, index) => {
            return level !== undefined ?
             level < 0 ?
                `${level}${levelMap[index]}` :
                `+${level}${levelMap[index]}` : undefined

        }).filter(cmd => cmd !== undefined).join('');

        const data = Buffer.from(msg, "utf-8");
        return this._bleDevice.writeToCharacteristic(Consts.BLECharacteristic.CIRCUITCUBE_2_MULTI_2,data, true)
    }

    public async stopAll() {
        const data = Buffer.from("0", "utf-8");
        return this._bleDevice.writeToCharacteristic(Consts.BLECharacteristic.CIRCUITCUBE_2_MULTI_2,data, true)
    }

    private async getVoltage() {
        const data = Buffer.from("b", "utf-8");
        return this._bleDevice.writeToCharacteristic(Consts.BLECharacteristic.CIRCUITCUBE_2_MULTI_1, data, false)
    }

    public async getName() {
        const data = Buffer.from("n?", "utf-8");
        return this._bleDevice.writeToCharacteristic(Consts.BLECharacteristic.CIRCUITCUBE_2_MULTI_1, data, true)
    }

    // this is following the protocol but does not seem to work
    public async setName(name:string) {
        if(name.length < 1 || name.length > 20) {
            throw new Error('name too long')
        }

        const data  = Buffer.concat([
            Buffer.from('n', "utf-8"),
            Buffer.from(name, 'utf-8'),
            Buffer.from("\r\n", 'utf-8')
        ]);
        return this._bleDevice.writeToCharacteristic(Consts.BLECharacteristic.CIRCUITCUBE_2_MULTI_1, data, true)
    }
}

const levelMap = ['a', 'b', 'c']
