import { EventEmitter } from "events";

import { Characteristic, Peripheral, Service } from "noble";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
const debug = Debug("hub");


/**
 * @class Hub
 * @extends EventEmitter
 */
export class Hub extends EventEmitter {


    public autoSubscribe: boolean;
    public type: Consts.Hubs = Consts.Hubs.UNKNOWN;
    public uuid: string;

    protected _ports: {[port: string]: Port} = {};
    protected _characteristics: {[uuid: string]: Characteristic} = {};

    private _peripheral: Peripheral;
    private _rssi: number = -100;
    private _batteryLevel: number = 100;

    constructor (peripheral: Peripheral, autoSubscribe: boolean = true) {
        super();
        this.autoSubscribe = !!autoSubscribe;
        this._peripheral = peripheral;
        this.uuid = peripheral.uuid;
    }


    /**
     * Connect to the Hub.
     * @method Hub#connect
     * @returns {Promise} Resolved when successfully connected.
     */
    public connect () {
        return new Promise((connectResolve, connectReject) => {

            const self = this;

            this._peripheral.connect((err: string) => {

                this._rssi = this._peripheral.rssi;

                const rssiUpdateInterval = setInterval(() => {
                    this._peripheral.updateRssi((err: string, rssi: number) => {
                        if (!err) {
                            if (this._rssi !== rssi) {
                                this._rssi = rssi;
                                debug(`RSSI change ${rssi}`);
                                self.emit("rssiChange", rssi);
                            }
                        }
                    });
                }, 2000);

                self._peripheral.on("disconnect", () => {
                clearInterval(rssiUpdateInterval);
                this.emit("disconnect");
                });

                self._peripheral.discoverServices([], (err: string, services: Service[]) => {

                    if (err) {
                        this.emit("error", err);
                        return;
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
                        this.emit("connect");
                        return connectResolve();
                    });

                });

            });

        });

    }


    /**
     * Disconnect the Hub.
     * @method Hub#disconnect
     */
    public disconnect () {
        this._peripheral.disconnect();
    }


    /**
     * Subscribe to sensor notifications on a given port.
     * @method Hub#subscribe
     * @param {string} port
     * @param {number|boolean} [mode=false] - The sensor mode to activate. If no mode is provided, the default for that sensor will be chosen.
     */
    public subscribe (port: string, mode: number | boolean = false, callback?: () => void) {
        let newMode = 0x00;
        if (!mode) {
            newMode = this._getModeForDeviceType(this._ports[port].type);
        }
        this._activatePortDevice(this._ports[port].value, this._ports[port].type, newMode, 0x00, callback);
    }

    /**
     * Unsubscribe to sensor notifications on a given port.
     * @method Hub#unsubscribe
     * @param {string} port
     */
    public unsubscribe (port: string, callback?: () => void) {
        const mode = this._getModeForDeviceType(this._ports[port].type);
        this._deactivatePortDevice(this._ports[port].value, this._ports[port].type, mode, 0x00, callback);
    }


    protected _subscribeToCharacteristic (characteristic: Characteristic, callback: (data: Buffer) => void) {
        characteristic.on("data", (data: Buffer) => {
            return callback(data);
        });
        characteristic.subscribe((err) => {
            if (err) {
                this.emit("error", err);
            }
        });
    }


    protected _activatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
        if (callback) {
            callback();
        }
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
        if (callback) {
            callback();
        }
    }


    protected _registerDeviceAttachment (port: Port, type: number) {

        if (port.connected) {
            port.type = type;
            if (this.autoSubscribe) {
                this._activatePortDevice(port.value, type, this._getModeForDeviceType(type), 0x00);
            }
        } else {
            port.type = Consts.Devices.UNKNOWN;
            debug(`Port ${port.id} disconnected`);
        }

    }


    private _getModeForDeviceType (type: Consts.Devices) {
        switch (type) {
            case Consts.Devices.BASIC_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_MOVE_HUB_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_DISTANCE:
                return (this.type === Consts.Hubs.WEDO2_SMART_HUB ? 0x00 : 0x08);
            case Consts.Devices.BOOST_TILT:
                return 0x04;
            default:
                return 0x00;
        }
    }


}
