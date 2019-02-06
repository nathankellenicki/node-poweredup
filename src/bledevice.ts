import { Characteristic, Peripheral, Service } from "noble";

import Debug = require("debug");
import { EventEmitter } from "events";
const debug = Debug("bledevice");


export class BLEDevice extends EventEmitter {

    // @ts-ignore
    private _noblePeripheral: Peripheral | null;
    private _webBLEServer: any;

    private _uuid: string;
    private _name: string = "";

    private _characteristics: {[uuid: string]: Characteristic} = {};


    constructor (device: any) {
        super();
        if (device._noble) {
            this._noblePeripheral = device;
            this._uuid = device.uuid;
            // NK: This hack allows LPF2.0 hubs to send a second advertisement packet consisting of the hub name before we try to read it
            setTimeout(() => {
                this._name = device.advertisement.localName;
                this.emit("discoverComplete");
            }, 1000);
        } else {
            this._webBLEServer = device;
            this._uuid = device.id;
            this._name = device.name;
            this.emit("discoverComplete");
        }
    }


    public get uuid () {
        return this._uuid;
    }


    public get name () {
        return this._name;
    }


    public connect () {
        return new Promise((resolve, reject) => {
            if (this._noblePeripheral) {
                this._noblePeripheral.connect((err: string) => {
                    return resolve();
                });
            } else {
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
                return resolve();
            }
        });
    }


    public discoverCharacteristicsForService (uuid: string) {
        uuid = this._sanitizeUUID(uuid);
        return new Promise(async (discoverResolve, discoverReject) => {
            if (this._noblePeripheral) {
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
        uuid = this._sanitizeUUID(uuid);
        if (this._noblePeripheral) {
            this._characteristics[uuid].on("data", (data: Buffer) => {
                return callback(data);
            });
            this._characteristics[uuid].subscribe((err) => {
                if (err) {
                    throw new Error(err);
                }
            });
        } else if (this._webBLEServer) {
            // @ts-ignore
            this._characteristics[uuid].addEventListener("characteristicvaluechanged", (event) => {
                return callback(event.target.value.buffer);
            });
        }
    }


    public readFromCharacteristic (uuid: string, callback: (err: string | null, data: Buffer | null) => void) {
        uuid = this._sanitizeUUID(uuid);
        if (this._noblePeripheral) {
            this._characteristics[uuid].read((err: string, data: Buffer) => {
                return callback(err, data);
            });
        } else if (this._webBLEServer) {
            try {
                // @ts-ignore
                this._characteristics[uuid].readValue().then((data) => {
                    callback(null, data);
                });
            } catch (err) {
                callback(err, null);
            }
        }
    }


    public writeToCharacteristic (uuid: string, data: Buffer, callback?: () => void) {
        uuid = this._sanitizeUUID(uuid);
        if (this._noblePeripheral) {
            this._characteristics[uuid].write(data, false, callback);
        }
    }


    private _sanitizeUUID (uuid: string) {
        return uuid.replace(/-/g, "");
    }


}
