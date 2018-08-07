import { EventEmitter } from "events";

import { Characteristic, Peripheral, Service } from "noble";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
import { resolve } from "path";
const debug = Debug("hub");


/**
 * @class Hub
 * @ignore
 * @extends EventEmitter
 */
export class Hub extends EventEmitter {


    public autoSubscribe: boolean = true;
    public useSpeedMap: boolean = true;
    public type: Consts.Hubs = Consts.Hubs.UNKNOWN;

    protected _ports: {[port: string]: Port} = {};
    protected _characteristics: {[uuid: string]: Characteristic} = {};

    protected _name: string;
    protected _batteryLevel: number = 100;

    private _peripheral: Peripheral;
    private _uuid: string;
    private _rssi: number = -100;

    constructor (peripheral: Peripheral, autoSubscribe: boolean = true) {
        super();
        this.autoSubscribe = !!autoSubscribe;
        this._peripheral = peripheral;
        this._uuid = peripheral.uuid;
        this._name = peripheral.advertisement.localName;
    }


    /**
     * @readonly
     * @property {string} name Name of the hub
     */
    public get name () {
        return this._name;
    }


    /**
     * @readonly
     * @property {string} uuid UUID of the hub
     */
    public get uuid () {
        return this._uuid;
    }


    /**
     * @readonly
     * @property {number} rssi Signal strength of the hub
     */
    public get rssi () {
        return this._rssi;
    }


    /**
     * @readonly
     * @property {number} batteryLevel Battery level of the hub (Percentage between 0-100)
     */
    public get batteryLevel () {
        return this._batteryLevel;
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
            let newMode = this._getModeForDeviceType(this._portLookup(port).type);
            if (mode) {
                newMode = mode;
            }
            this._activatePortDevice(this._portLookup(port).value, this._portLookup(port).type, newMode, 0x00, () => {
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
            const mode = this._getModeForDeviceType(this._portLookup(port).type);
            this._deactivatePortDevice(this._portLookup(port).value, this._portLookup(port).type, mode, 0x00, () => {
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
                /**
                 * Emits when a motor or sensor is attached to the Hub.
                 * @event Hub#attach
                 * @param {string} port
                 * @param {number} type A number representing one of the peripheral consts.
                 */
                this.emit("attach", port.id, type);
            }
        } else {
            port.type = Consts.Devices.UNKNOWN;
            debug(`Port ${port.id} disconnected`);
            /**
             * Emits when an attached motor or sensor is detached from the Hub.
             * @event Hub#detach
             * @param {string} port
             */
            this.emit("detach", port.id);
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
            return Math.round((speed - -100) * (240 - 158) / (-1 - -100) + 158); // In reverse, minimum speed is 240, maximum speed is 158
        } else {
            return 0;
        }
    }


    protected _calculateRamp (fromSpeed: number, toSpeed: number, time: number) {
        const emitter = new EventEmitter();
        const steps = Math.abs(toSpeed - fromSpeed);
        let delay = time / steps;
        let increment = 1;
        if (delay < 50 && steps > 0) {
            increment = 50 / delay;
            delay = 50;
        }
        if (fromSpeed > toSpeed) {
            increment = -increment;
        }
        let i = 0;
        const interval = setInterval(() => {
            let speed = Math.round(fromSpeed + (++i * increment));
            if (toSpeed > fromSpeed && speed > toSpeed) {
                speed = toSpeed;
            } else if (fromSpeed > toSpeed && speed < toSpeed) {
                speed = toSpeed;
            }
            emitter.emit("changeSpeed", speed);
            if (speed === toSpeed) {
                clearInterval(interval);
                emitter.emit("finished");
            }
        }, delay);
        return emitter;
}


    protected _portLookup (port: string) {
        if (!this._ports[port.toUpperCase()]) {
            throw new Error(`Port ${port.toUpperCase()} does not exist on this Hub type`);
        }
        return this._ports[port];
    }


    private _getModeForDeviceType (type: Consts.Devices) {
        switch (type) {
            case Consts.Devices.BASIC_MOTOR:
                return 0x02;
            case Consts.Devices.TRAIN_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_TACHO_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_MOVE_HUB_MOTOR:
                return 0x02;
            case Consts.Devices.BOOST_DISTANCE:
                return (this.type === Consts.Hubs.WEDO2_SMART_HUB ? 0x00 : 0x08);
            case Consts.Devices.BOOST_TILT:
                return 0x04;
            case Consts.Devices.POWERED_UP_REMOTE_BUTTON:
                return 0x00;
            default:
                return 0x00;
        }
    }


}
