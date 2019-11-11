import Debug = require("debug");
import { EventEmitter } from "events";
import { IBLEDevice } from "./interfaces";
const debug = Debug("testdevice");


export class TestDevice extends EventEmitter implements IBLEDevice {

    private _uuid: string;
    private _name: string = "";

    private _listeners: {[uuid: string]: any} = {};
    private _characteristics: {[uuid: string]: any} = {};

    private _queue: Promise<any> = Promise.resolve();
    private _mailbox: Buffer[] = [];

    private _outbox: {[uuid: string]: Buffer[]} = {};
    private _outboxCallback: {[uuid: string]: () => void} = {};
    private _inbox: {[uuid: string]: Buffer[]} = {};
    private _inboxCallback: {[uuid: string]: (data: Buffer) => void} = {};

    private _connected: boolean = false;
    private _connecting: boolean = false;


    constructor () {
        super();
        this._uuid = "test-device";
        this._name = "Test Device";
        setTimeout(() => {
            this.emit("discoverComplete");
        }, 2000);
    }


    public get uuid () {
        return this._uuid;
    }


    public get name () {
        return this._name;
    }


    public get connecting () {
        return this._connecting;
    }


    public get connected () {
        return this._connected;
    }


    public connect () {
        return new Promise((resolve, reject) => {
            this._connected = true;
            return resolve();
        });
    }


    public disconnect () {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }


    public discoverCharacteristicsForService (uuid: string) {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }


    public subscribeToCharacteristic (uuid: string, callback: (data: Buffer) => void) {
        this._inbox[uuid] = this._inbox[uuid] || [];
        if (this._inbox[uuid].length >= 1) {
            // @ts-ignore
            callback(this._inbox[uuid].shift());
        }
        this._inboxCallback[uuid] = (data) => {
            callback(data);
        };
        return;
    }


    public addToCharacteristicMailbox (uuid: string, data: Buffer) {
        this._mailbox.push(data);
    }


    public readFromCharacteristic (uuid: string, callback: (err: string | null, data: Buffer | null) => void) {
        callback(null, Buffer.alloc(0));
    }


    public writeToCharacteristic (uuid: string, data: Buffer, callback?: () => void) {
        this._outbox[uuid] = this._outbox[uuid] || [];
        this._outbox[uuid].push(data);
        if (this._outboxCallback[uuid]) {
            this._outboxCallback[uuid]();
            delete this._outboxCallback[uuid];
        }
        if (callback) {
            callback();
        }
    }


    public readFromOutbox (uuid: string) {
        return new Promise((resolve, reject) => {
            this._outbox[uuid] = this._outbox[uuid] || [];
            if (this._outbox[uuid].length >= 1) {
                return resolve(this._outbox[uuid].shift());
            } else {
                this._outboxCallback[uuid] = () => {
                    return resolve(this._outbox[uuid].shift());
                };
            }
        });
    }


    public postToInbox (uuid: string, data: Buffer) {
        if (this._inboxCallback[uuid]) {
            this._inboxCallback[uuid](data);
        } else {
            this._inbox[uuid] = this._inbox[uuid] || [];
            this._inbox[uuid].push(data);
        }
    }


    public clearOutbox (uuid: string) {
        this._outbox[uuid] = [];
        delete this._outboxCallback[uuid];
    }


    private _sanitizeUUID (uuid: string) {
        return uuid.replace(/-/g, "");
    }


}

