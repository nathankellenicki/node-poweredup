import { EventEmitter } from "events";

import { versionToInt32 } from './commons';
import { IBLEAbstraction } from "../../src/interfaces";

import * as Consts from '../../src/consts';

export class FakeBLEDevice extends EventEmitter implements IBLEAbstraction {
    private _uuid: string;
    private _name: string;
    private _firmware: string;
    private _hardware: string;


    private _connecting: boolean = false;
    private _connected: boolean = false;
    private _handlers: {[characteristic: string]: ((message: Buffer) => void)[]} = {}
    private _incommingMessages: {[characteristic: string]: string[]} = {};

    constructor(uuid: string, name: string, firmware: string = '1.0.00.0000', hardware: string = '1.0.00.0000') {
        super();
        this._uuid = uuid;
        this._name = name;
        this._firmware = firmware;
        this._hardware = hardware;
    }

    public get uuid() { return this._uuid }
    public get name() { return this._name }
    public get connecting() { return this._connecting }
    public get connected() { return this._connected }

    public connect(): Promise<void> {
        this.emit('connect');
        this._connecting = true;
        return new Promise(resolve => {
            setTimeout(() => {
                this._connected = true;
                this.emit('connected');
                resolve();
            }, 10);
        });
    };
    public async disconnect() {
        this._connected = false;
        this.emit('disconnected');
    };

    public async discoverCharacteristicsForService(uuid: string) {
        this.emit('discoverCharacteristicsForService', { uuid })
    };

    public async subscribeToCharacteristic(uuid: string, handler: (message: Buffer) => void) {
        this._handlers[uuid] = this._handlers[uuid] || [];
        this._handlers[uuid].push(handler)
    };

    public async writeToCharacteristic(uuid: string, message: Buffer) {
        this._incommingMessages[uuid] = this._incommingMessages[uuid] || [];
        this._incommingMessages[uuid].push(message.toString('hex'));
        this.emit('writeToCharacteristic', { uuid, message });

        // Some messages need reply
        if (uuid === Consts.BLECharacteristic.LPF2_ALL) {
            const hex = message.toString('hex')
            switch (hex) {
                case '0500010305': { // firmware version
                    const message = Buffer.from([0x01, 0x03, 0x06, 0x00, 0x00, 0x00, 0x00]);
                    message.writeInt32LE(versionToInt32(this._firmware), 3);
                    this.send(message);
                    break;
                }
                case '0500010405': { // hardware version
                    const message = Buffer.from([0x01, 0x04, 0x06, 0x00, 0x00, 0x00, 0x00]);
                    message.writeInt32LE(versionToInt32(this._hardware), 3);
                    this.send(message);
                    break;
                }
                case '0500010d05': { // primary MAC address 00:00:00:00:00:00
                    this.send(Buffer.from([0x01, 0x0d, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
                    break;
                }
            }
        }
    };

    public async addToCharacteristicMailbox() {};
    public async readFromCharacteristic() {};

    public send(message: Buffer, uuid:string = Consts.BLECharacteristic.LPF2_ALL) {
        message = Buffer.concat([Buffer.from([message.length + 2, 0x00]), message])
        return new Promise(resolve => {
            setTimeout(
                () => {
                    (this._handlers[uuid] || []).forEach(callback => callback(message))
                    resolve();
                },
                10
            )
        })
    };
    public get messages() { return this._incommingMessages; }
};
