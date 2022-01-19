import { Characteristic, Peripheral, Service } from "@abandonware/noble";

import Debug = require("debug");
import { EventEmitter } from "events";
import { IBLEAbstraction } from "./interfaces";
const debug = Debug("bledevice");


export class NobleDevice extends EventEmitter implements IBLEAbstraction {

    private _noblePeripheral: Peripheral;

    private _uuid: string;
    private _name: string = "";

    private _listeners: {[uuid: string]: any} = {};
    private _characteristics: {[uuid: string]: Characteristic} = {};

    private _queue: Promise<any> = Promise.resolve();
    private _mailbox: Buffer[] = [];

    private _connected: boolean = false;
    private _connecting: boolean = false;


    constructor (device: any) {
        super();
        this._noblePeripheral = device;
        this._uuid = device.uuid;
        device.on("disconnect", () => {
            this._connecting = false;
            this._connected = false;
            this.emit("disconnect");
        });
        // NK: This hack allows LPF2.0 hubs to send a second advertisement packet consisting of the hub name before we try to read it
        setTimeout(() => {
            this._name = device.advertisement.localName;
            this.emit("discoverComplete");
        }, 1000);
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
        return new Promise<void>((resolve, reject) => {
            this._connecting = true;
            this._noblePeripheral.connect((err: string) => {
                if(err) {
                    return reject(err);
                }

                this._connecting = false;
                this._connected = true;
                return resolve();
            });
        });
    }


    public disconnect () {
        return new Promise<void>((resolve) => {
            this._noblePeripheral.disconnect();
            this._connecting = false;
            this._connected = false;
            return resolve();
        });
    }


    public discoverCharacteristicsForService (uuid: string) {
        return new Promise<void>(async (discoverResolve, discoverReject) => {
            uuid = this._sanitizeUUID(uuid);
            this._noblePeripheral.discoverServices([uuid], (err: string, services: Service[]) => {
                if (err) {
                    return discoverReject(err);
                }
                debug("Service/characteristic discovery started");
                const servicePromises: Promise<void>[] = [];
                services.forEach((service) => {
                    servicePromises.push(new Promise((resolve) => {
                        service.discoverCharacteristics([], (err, characteristics) => {
                            characteristics.forEach((characteristic) => {
                                this._characteristics[characteristic.uuid] = characteristic;
                            });
                            return resolve();
                        });
                    }));
                });

                Promise.all(servicePromises).then(() => {
                    debug("Service/characteristic discovery finished");
                    return discoverResolve();
                });
            });
        });
    }


    public subscribeToCharacteristic (uuid: string, callback: (data: Buffer) => void) {
        uuid = this._sanitizeUUID(uuid);
        this._characteristics[uuid].on("data", (data: Buffer) => {
            return callback(data);
        });
        this._characteristics[uuid].subscribe((err) => {
            if (err) {
                throw new Error(err);
            }
        });
    }


    public addToCharacteristicMailbox (uuid: string, data: Buffer) {
        this._mailbox.push(data);
    }


    public readFromCharacteristic (uuid: string, callback: (err: string | null, data: Buffer | null) => void) {
        uuid = this._sanitizeUUID(uuid);
        this._characteristics[uuid].read((err: string, data: Buffer) => {
            return callback(err, data);
        });
    }


    public writeToCharacteristic (uuid: string, data: Buffer) {
        return new Promise<void>((resolve, reject) => {
            uuid = this._sanitizeUUID(uuid);
            this._characteristics[uuid].write(data, false, (error) => {
                if(error) {
                    return reject(error);
                }

                return resolve();
            });
        })
    }


    private _sanitizeUUID (uuid: string) {
        return uuid.replace(/-/g, "");
    }


}
