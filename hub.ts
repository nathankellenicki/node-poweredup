import { EventEmitter } from "events";

import { Characteristic, Peripheral, Service } from "noble";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
import { METHODS } from "http";
const debug = Debug("hub");


/**
 * @class Hub
 * @extends EventEmitter
 */
export class Hub extends EventEmitter {


    public autoSubscribe: boolean = true;
    public useSpeedMap: boolean = true;
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
     * @returns {Promise} Resolved upon successful connect.
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
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public disconnect () {
        return new Promise((resolve, reject) => {
            this._peripheral.disconnect(() => {
                return resolve();
            });
        });
    }


    /**
     * Subscribe to sensor notifications on a given port.
     * @method Hub#subscribe
     * @param {string} port
     * @param {number} [mode] The sensor mode to activate. If no mode is provided, the default for that sensor will be chosen.
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public subscribe (port: string, mode?: number) {
        return new Promise((resolve, reject) => {
            let newMode = 0x00;
            if (mode && !(typeof mode === "number")) {
                newMode = this._getModeForDeviceType(this._ports[port].type);
            }
            this._activatePortDevice(this._ports[port].value, this._ports[port].type, newMode, 0x00, () => {
                return resolve();
            });
        });
    }

    /**
     * Unsubscribe to sensor notifications on a given port.
     * @method Hub#unsubscribe
     * @param {string} port
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public unsubscribe (port: string) {
        return new Promise((resolve, reject) => {
            const mode = this._getModeForDeviceType(this._ports[port].type);
            this._deactivatePortDevice(this._ports[port].value, this._ports[port].type, mode, 0x00, () => {
                return resolve();
            });
        });
    }


    /**
     * Sleep a given amount of time.
     *
     * This is a helper method to make it easier to add delays into a chain of commands.
     * @method Hub#sleep
     * @param {number} delay How long to sleep (in milliseconds).
     * @returns {Promise} Resolved after the delay is finished.
     */
    public sleep (delay: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }


    /**
     * Wait until a given list of concurrently running commands are complete.
     *
     * This is a helper method to make it easier to wait for concurrent commands to complete.
     * @method Hub#wait
     * @param {Array<Promise<any>>} commands Array of executing commands.
     * @returns {Promise} Resolved after the commands are finished.
     */
    public wait (commands: Array<Promise<any>>) {
        return Promise.all(commands);
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


    protected _getPortForPortNumber (num: number) {

        for (const key of Object.keys(this._ports)) {
            if (this._ports[key].value === num) {
                return this._ports[key];
            }
        }

        return false;

    }


    protected _mapSpeed (speed: number) { // Speed range of -100 to 100 is supported unless speed mapping is turned off, in which case, you're on your own!
        if (!this.useSpeedMap) {
            return speed;
        }
        if (speed > 0) {
            if (speed > 100) {
                speed = 100;
            }
            return Math.round((speed - 1) * (97 - 15) / (100 - 1) + 15); // Forward, minimum speed is 15, maximum speed is 97
        } else if (speed < 0) {
            if (speed < -100) {
                speed = -100;
            }
            return Math.round((speed - -100) * (245 - 160) / (-1 - -100) + 160); // In reverse, minimum speed is 245, maximum speed is 160
        } else {
            return 0;
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
