import { Characteristic, Peripheral, Service } from "noble";

import Debug = require("debug");
import { EventEmitter } from "events";
import { write } from "fs";
const debug = Debug("bledevice");


export class BLEDevice extends EventEmitter {

    // @ts-ignore
    private _noblePeripheral: Peripheral | null;
    private _webBLEServer: any;

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
        if (device._noble) {
            this._noblePeripheral = device;
            this._uuid = device.uuid;
            device.on("disconnect", () => {
                this._connected = false;
                this._connected = false;
                this.emit("disconnect");
            });
            // NK: This hack allows LPF2.0 hubs to send a second advertisement packet consisting of the hub name before we try to read it
            setTimeout(() => {
                this._name = device.advertisement.localName;
                this.emit("discoverComplete");
            }, 1000);
        } else {
            this._webBLEServer = device;
            this._uuid = device.device.id;
            this._name = device.device.name;
            device.device.addEventListener("gattserverdisconnected", () => {
                this._connected = false;
                this._connected = false;
                this.emit("disconnect");
            });
            setTimeout(() => {
                this.emit("discoverComplete");
            }, 2000);
        }
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
            if (this._noblePeripheral) {
                this._connecting = true;
                this._noblePeripheral.connect((err: string) => {
                    this._connecting = false;
                    this._connected = true;
                    return resolve();
                });
            } else {
                this._connected = true;
                return resolve();
            }
        });
    }


    public disconnect () {
        return new Promise((resolve, reject) => {
            if (this._noblePeripheral) {
                this._noblePeripheral.connect((err: string) => {
                    return resolve();
                });
            } else {
                this._webBLEServer.device.gatt.disconnect();
                return resolve();
            }
        });
    }


    public discoverCharacteristicsForService (uuid: string) {
        return new Promise(async (discoverResolve, discoverReject) => {
            if (this._noblePeripheral) {
                uuid = this._sanitizeUUID(uuid);
                this._noblePeripheral.discoverServices([uuid], (err: string, services: Service[]) => {
                    if (err) {
                        return discoverReject(err);
                    }
                    debug("Service/characteristic discovery started");
                    const servicePromises: Array<Promise<null>> = [];
                    services.forEach((service) => {
                        servicePromises.push(new Promise((resolve, reject) => {
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
            } else if (this._webBLEServer) {
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
            }
        });
    }


    public subscribeToCharacteristic (uuid: string, callback: (data: Buffer) => void) {
        if (this._noblePeripheral) {
            uuid = this._sanitizeUUID(uuid);
            this._characteristics[uuid].on("data", (data: Buffer) => {
                return callback(data);
            });
            this._characteristics[uuid].subscribe((err) => {
                if (err) {
                    throw new Error(err);
                }
            });
        } else if (this._webBLEServer) {
            if (this._listeners[uuid]) {
                // @ts-ignore
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
            // @ts-ignore
            this._characteristics[uuid].addEventListener("characteristicvaluechanged", this._listeners[uuid]);
            for (const data of this._mailbox) {
                callback(data);
            }
            this._mailbox = [];
            // @ts-ignore
            this._characteristics[uuid].startNotifications();
        }
    }


    public addToCharacteristicMailbox (uuid: string, data: Buffer) {
        this._mailbox.push(data);
    }


    public readFromCharacteristic (uuid: string, callback: (err: string | null, data: Buffer | null) => void) {
        if (this._noblePeripheral) {
            uuid = this._sanitizeUUID(uuid);
            this._characteristics[uuid].read((err: string, data: Buffer) => {
                return callback(err, data);
            });
        } else if (this._webBLEServer) {
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
    }


    public writeToCharacteristic (uuid: string, data: Buffer, callback?: () => void) {
        if (this._noblePeripheral) {
            uuid = this._sanitizeUUID(uuid);
            this._characteristics[uuid].write(data, false, callback);
        } else {
            // @ts-ignore
            this._queue = this._queue.then(() => this._characteristics[uuid].writeValue(data)).then(() => {
                if (callback) {
                    callback();
                }
            });
        }
    }


    private _sanitizeUUID (uuid: string) {
        return uuid.replace(/-/g, "");
    }


}
