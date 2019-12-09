import { EventEmitter } from "events";

import { IBLEAbstraction } from "./interfaces";

import * as Consts from "./consts";

import Debug = require("debug");
import { Device } from "./device";
const debug = Debug("hub");


/**
 * @class Hub
 * @extends EventEmitter
 */
export class Hub extends EventEmitter {

    public useSpeedMap: boolean = true;

    protected _attachedDevices: {[portId: number]: Device} = {};

    protected _portNames: {[port: string]: number} = {};
    // protected _virtualPorts: {[port: string]: Port} = {};

    protected _name: string = "";
    protected _firmwareVersion: string = "0.0.00.0000";
    protected _hardwareVersion: string = "0.0.00.0000";
    protected _primaryMACAddress: string = "00:00:00:00:00:00";
    protected _batteryLevel: number = 100;
    protected _voltage: number = 0;
    protected _current: number = 0;
    protected _rssi: number = -60;

    protected _bleDevice: IBLEAbstraction;

    private _type: Consts.HubType;

    constructor (device: IBLEAbstraction, type: Consts.HubType = Consts.HubType.UNKNOWN) {
        super();
        this._type = type;
        this._bleDevice = device;
        device.on("disconnect", () => {
            /**
             * Emits when the hub is disconnected.
             * @event Hub#disconnect
             */
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
     * @property {string} type Hub type
     */
    public get type () {
        return this._type;
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
            await this._bleDevice.connect();
            return connectResolve();
        });

    }


    /**
     * Disconnect the Hub.
     * @method Hub#disconnect
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public disconnect () {
        return this._bleDevice.disconnect();
    }


    public getPortNameForPortId (portId: number) {
        for (const port of Object.keys(this._portNames)) {
            if (this._portNames[port] === portId) {
                return port;
            }
        }
        return;
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


    public send (message: Buffer, uuid: string, callback?: () => void) {
        if (callback) {
            callback();
        }
    }


    public subscribe (portId: number, mode: number) {
        // NK Do nothing here
    }


    protected _attachDevice (device: Device) {
        this._attachedDevices[device.portId] = device;
        /**
         * Emits when a device is attached to the Hub.
         * @event Hub#attach
         * @param {Device} device
         */
        this.emit("attach", device);
    }


    protected _detachDevice (device: Device) {
        delete this._attachedDevices[device.portId];
        /**
         * Emits when a device is detached from the Hub.
         * @event Hub#attach
         * @param {Device} device
         */
        this.emit("detach", device);
    }


    protected _getDeviceByPortId (portId: number) {
        return this._attachedDevices[portId];
    }


    // protected _calculateRamp (fromSpeed: number, toSpeed: number, time: number, port: Port) {
    //     const emitter = new EventEmitter();
    //     const steps = Math.abs(toSpeed - fromSpeed);
    //     let delay = time / steps;
    //     let increment = 1;
    //     if (delay < 50 && steps > 0) {
    //         increment = 50 / delay;
    //         delay = 50;
    //     }
    //     if (fromSpeed > toSpeed) {
    //         increment = -increment;
    //     }
    //     let i = 0;
    //     const interval = setInterval(() => {
    //         let speed = Math.round(fromSpeed + (++i * increment));
    //         if (toSpeed > fromSpeed && speed > toSpeed) {
    //             speed = toSpeed;
    //         } else if (fromSpeed > toSpeed && speed < toSpeed) {
    //             speed = toSpeed;
    //         }
    //         emitter.emit("changeSpeed", speed);
    //         if (speed === toSpeed) {
    //             clearInterval(interval);
    //             emitter.emit("finished");
    //         }
    //     }, delay);
    //     port.setEventTimer(interval);
    //     return emitter;
    // }


    // private _getModeForDeviceType (type: Consts.DeviceType) {
    //     switch (type) {
    //         case Consts.DeviceType.SIMPLE_MEDIUM_LINEAR_MOTOR:
    //             return 0x02;
    //         case Consts.DeviceType.TRAIN_MOTOR:
    //             return 0x02;
    //         case Consts.DeviceType.BOOST_TACHO_MOTOR:
    //             return 0x02;
    //         case Consts.DeviceType.BOOST_MOVE_HUB_MOTOR:
    //             return 0x02;
    //         case Consts.DeviceType.CONTROL_PLUS_LARGE_MOTOR:
    //             return 0x02;
    //         case Consts.DeviceType.CONTROL_PLUS_XLARGE_MOTOR:
    //             return 0x02;
    //         case Consts.DeviceType.CONTROL_PLUS_TILT:
    //             return 0x00;
    //         case Consts.DeviceType.CONTROL_PLUS_ACCELEROMETER:
    //             return 0x00;
    //         case Consts.DeviceType.COLOR_DISTANCE_SENSOR:
    //             return (this.type === Consts.HubType.WEDO2_SMART_HUB ? 0x00 : 0x08);
    //         case Consts.DeviceType.BOOST_TILT:
    //             return 0x04;
    //         default:
    //             return 0x00;
    //     }
    // }


}
