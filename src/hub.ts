import { EventEmitter } from "events";

import { IBLEDevice } from "./interfaces";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
const debug = Debug("hub");


/**
 * @class Hub
 * @extends EventEmitter
 */
export class Hub extends EventEmitter {


    public autoSubscribe: boolean = true;
    public useSpeedMap: boolean = true;
    public type: Consts.HubType = Consts.HubType.UNKNOWN;

    protected _ports: {[port: string]: Port} = {};
    protected _virtualPorts: {[port: string]: Port} = {};

    protected _name: string = "";
    protected _firmwareVersion: string = "0.0.00.0000";
    protected _hardwareVersion: string = "0.0.00.0000";
    protected _primaryMACAddress: string = "00:00:00:00:00:00";
    protected _batteryLevel: number = 100;
    protected _voltage: number = 0;
    protected _current: number = 0;
    protected _rssi: number = -60;

    protected _bleDevice: IBLEDevice;

    private _isConnecting = false;
    private _isConnected = false;

    constructor (device: IBLEDevice, autoSubscribe: boolean = true) {
        super();
        this.autoSubscribe = !!autoSubscribe;
        this._bleDevice = device;
        device.on("disconnect", () => {
            this.emit("disconnect");
        });
    }


    /**
     * @readonly
     * @property {string} name Name of the hub
     */
    public get name () {
        return this._bleDevice.name;
    }


    /**
     * @readonly
     * @property {string} firmwareVersion Firmware version of the hub
     */
    public get firmwareVersion () {
        return this._firmwareVersion;
    }


    /**
     * @readonly
     * @property {string} firmwareVersion Hardware version of the hub
     */
    public get hardwareVersion () {
        return this._hardwareVersion;
    }


    /**
     * @readonly
     * @property {string} primaryMACAddress Primary MAC address of the hub
     */
    public get primaryMACAddress () {
        return this._primaryMACAddress;
    }


    /**
     * @readonly
     * @property {string} uuid UUID of the hub
     */
    public get uuid () {
        return this._bleDevice.uuid;
    }


    /**
     * @readonly
     * @property {number} batteryLevel Battery level of the hub (Percentage between 0-100)
     */
    public get batteryLevel () {
        return this._batteryLevel;
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
     * @property {number} voltage Voltage of the hub (Volts)
     */
    public get voltage () {
        return this._voltage;
    }


    /**
     * @readonly
     * @property {number} current Current usage of the hub (Milliamps)
     */
    public get current () {
        return this._current;
    }


    /**
     * Connect to the Hub.
     * @method Hub#connect
     * @returns {Promise} Resolved upon successful connect.
     */
    public connect () {
        return new Promise(async (connectResolve, connectReject) => {
            if (this._bleDevice.connecting) {
                return connectReject("Already connecting");
            } else if (this._bleDevice.connected) {
                return connectReject("Already connected");
            }
            this._isConnecting = true;
            await this._bleDevice.connect();
            return connectResolve();
        });

    }


    /**
     * Disconnect the Hub.
     * @method Hub#disconnect
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public async disconnect () {
        this._bleDevice.disconnect();
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
            if (mode !== undefined) {
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
            global.setTimeout(resolve, delay);
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


    /**
     * Get the hub type.
     * @method Hub#getHubType
     * @returns {HubType}
     */
    public getHubType () {
        return this.type;
    }


    /**
     * Get the device type for a given port.
     * @method Hub#getPortDeviceType
     * @param {string} port
     * @returns {DeviceType}
     */
    public getPortDeviceType (port: string) {
        return this._portLookup(port).type;
    }


    // protected _getCharacteristic (uuid: string) {
    //     return this._characteristics[uuid.replace(/-/g, "")];
    // }


    // protected _subscribeToCharacteristic (characteristic: Characteristic, callback: (data: Buffer) => void) {
    //     characteristic.on("data", (data: Buffer) => {
    //         return callback(data);
    //     });
    //     characteristic.subscribe((err) => {
    //         if (err) {
    //             this.emit("error", err);
    //         }
    //     });
    // }


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
                 * @param {DeviceType} type
                 */
                this.emit("attach", port.id, type);
            }
        } else {
            port.type = Consts.DeviceType.UNKNOWN;
            debug(`Port ${port.id} disconnected`);
            /**
             * Emits when an attached motor or sensor is detached from the Hub.
             * @event Hub#detach
             * @param {string} port
             */
            if (this._virtualPorts[port.id]) {
                delete this._virtualPorts[port.id];
            }
            this.emit("detach", port.id);
        }

    }


    protected _getPortForPortNumber (num: number) {

        for (const key of Object.keys(this._ports)) {
            if (this._ports[key].value === num) {
                return this._ports[key];
            }
        }

        for (const key of Object.keys(this._virtualPorts)) {
            if (this._virtualPorts[key].value === num) {
                return this._virtualPorts[key];
            }
        }

        return false;

    }


    protected _mapSpeed (speed: number) { // Speed range of -100 to 100 is supported unless speed mapping is turned off, in which case, you're on your own!
        if (!this.useSpeedMap) {
            return speed;
        }

        if (speed === 127) {
            return 127; // Hard stop
        }

        if (speed > 100) {
            speed = 100;
        } else if (speed < -100) {
            speed = -100;
        }

        return speed;
    }


    protected _calculateRamp (fromSpeed: number, toSpeed: number, time: number, port: Port) {
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
        port.setEventTimer(interval);
        return emitter;
    }


    protected _portLookup (portName: string) {
        const portNameUpper = portName.toUpperCase();
        const port = this._ports[portNameUpper] || this._virtualPorts[portNameUpper];
        if (!port) {
            throw new Error(`Port ${portNameUpper} does not exist on this Hub type`);
        }
        return port;
    }

    private _getModeForDeviceType (type: Consts.DeviceType) {
        switch (type) {
            case Consts.DeviceType.BASIC_MOTOR:
                return 0x02;
            case Consts.DeviceType.TRAIN_MOTOR:
                return 0x02;
            case Consts.DeviceType.BOOST_TACHO_MOTOR:
                return 0x02;
            case Consts.DeviceType.BOOST_MOVE_HUB_MOTOR:
                return 0x02;
            case Consts.DeviceType.CONTROL_PLUS_LARGE_MOTOR:
                return 0x02;
            case Consts.DeviceType.CONTROL_PLUS_XLARGE_MOTOR:
                return 0x02;
            case Consts.DeviceType.CONTROL_PLUS_TILT:
                return 0x00;
            case Consts.DeviceType.CONTROL_PLUS_ACCELEROMETER:
                return 0x00;
            case Consts.DeviceType.BOOST_DISTANCE:
                return (this.type === Consts.HubType.WEDO2_SMART_HUB ? 0x00 : 0x08);
            case Consts.DeviceType.BOOST_TILT:
                return 0x04;
            default:
                return 0x00;
        }
    }


}
