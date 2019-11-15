import Debug = require("debug");
import { EventEmitter } from "events";
import { IBLEDevice } from "./interfaces";
const debug = Debug("bledevice");


export class WebBLEDevice extends EventEmitter implements IBLEDevice {

    private _webBLEServer: any;

    private _uuid: string;
    private _name: string = "";

    private _listeners: {[uuid: string]: any} = {};
    private _characteristics: {[uuid: string]: any} = {};

    private _queue: Promise<any> = Promise.resolve();
    private _mailbox: Buffer[] = [];

    private _connected: boolean = false;
    private _connecting: boolean = false;


    constructor (device: any) {
        super();
        this._webBLEServer = device;
        this._uuid = device.device.id;
        this._name = device.device.name;
        device.device.addEventListener("gattserverdisconnected", () => {
            this._connecting = false;
            this._connected = false;
            this.emit("disconnect");
        });
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
            this._webBLEServer.device.gatt.disconnect();
            return resolve();
        });
    }


    public discoverCharacteristicsForService (uuid: string) {
        return new Promise(async (discoverResolve, discoverReject) => {
            debug("Service/characteristic discovery started");
            let service;
            try {
                service = await this._webBLEServer.getPrimaryService(uuid);
            } catch (err) {
                return discoverReject(err);
            }
            const characteristics = await service.getCharacteristics();
            for (const characteristic of characteristics) {
                this._characteristics[characteristic.uuid] = characteristic;
            }
            debug("Service/characteristic discovery finished");
            return discoverResolve();
        });
    }


    public subscribeToCharacteristic (uuid: string, callback: (data: Buffer) => void) {
        if (this._listeners[uuid]) {
            this._characteristics[uuid].removeEventListener("characteristicvaluechanged", this._listeners[uuid]);
        }
        // @ts-ignore
        this._listeners[uuid] = (event) => {
            const buf = Buffer.alloc(event.target.value.buffer.byteLength);
            const view = new Uint8Array(event.target.value.buffer);
            for (let i = 0; i < buf.length; i++) {
                buf[i] = view[i];
            }
            return callback(buf);
        };
        this._characteristics[uuid].addEventListener("characteristicvaluechanged", this._listeners[uuid]);
        for (const data of this._mailbox) {
            callback(data);
        }
        this._mailbox = [];
        this._characteristics[uuid].startNotifications();
    }


    public addToCharacteristicMailbox (uuid: string, data: Buffer) {
        this._mailbox.push(data);
    }


    public readFromCharacteristic (uuid: string, callback: (err: string | null, data: Buffer | null) => void) {
        // @ts-ignore
        this._characteristics[uuid].readValue().then((data) => {
            const buf = Buffer.alloc(data.buffer.byteLength);
            const view = new Uint8Array(data.buffer);
            for (let i = 0; i < buf.length; i++) {
                buf[i] = view[i];
            }
            callback(null, buf);
        });
    }


    public writeToCharacteristic (uuid: string, data: Buffer, callback?: () => void) {
        this._queue = this._queue.then(() => this._characteristics[uuid].writeValue(data)).then(() => {
            if (callback) {
                callback();
            }
        });
    }


    private _sanitizeUUID (uuid: string) {
        return uuid.replace(/-/g, "");
    }


}
