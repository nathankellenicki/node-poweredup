import { EventEmitter } from "events";

import { IBLEAbstraction } from "../../interfaces";

import { Device, DeviceVersion } from "../../devices/generic/device";

import { devices, deviceTypeNames } from "../../devices";

import * as Consts from "../../consts";

import Debug = require("debug");
const debug = Debug("basehub");

/**
 * @class BaseHub
 * @extends EventEmitter
 */
export class BaseHub extends EventEmitter {
    public static get type () {
        return this._type;
    }
    public static get typeName () {
        return this._typeName;
    }

    protected static _type: number = 0;
    protected static _typeName: string = "UNKNOW";
    protected static _portMap: {[portName: string]: number} = {};

    protected _attachedDevices: {[portId: number]: Device} = {};
    // protected _virtualPorts: {[portName: string]: Port} = {};

    protected _name: string = "";
    protected _firmwareVersion: string = "0.0.00.0000";
    protected _hardwareVersion: string = "0.0.00.0000";
    protected _primaryMACAddress: string = "00:00:00:00:00:00";
    protected _batteryLevel: number = 100;
    protected _rssi: number = -60;

    protected _bleDevice: IBLEAbstraction;

    private _attachCallbacks: Array<((device: Device) => boolean)> = [];

    constructor (device: IBLEAbstraction, portMap: {[portName: string]: number} = {}) {
        super();
        this.setMaxListeners(20); // Technic Medium Hub has 9 built in devices + 4 external ports. Node.js throws a warning after 11 attached event listeners.
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
        return this.constructor._type;
    }

    /**
     * @readonly
     * @property {string} typeName Hub type name
     */
    public get typeName () {
        return this.constructor._typeName;
    }

    /**
     * @readonly
     * @property {string[]} ports Array of port names
     */
    public get ports () {
        return Object.keys(this._getPortMap());
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


    public getDeviceAtPort (portName: string) {
        const portId = this._getPortMap()[portName];
        if (portId !== undefined) {
            return this._attachedDevices[portId];
        } else {
            throw new Error(`Port ${portName} does not exist on this hub type`);
        }
    }


    public waitForDeviceAtPort (portName: string) {
        return new Promise((resolve) => {
            const existingDevice = this.getDeviceAtPort(portName);
            if (existingDevice) {
                return resolve(existingDevice);
            }
            this._attachCallbacks.push((device) => {
                if (device.portName === portName) {
                    resolve(device);
                    return true;
                } else {
                    return false;
                }
            });
        });
    }


    public getDevices () {
        return Object.values(this._attachedDevices);
    }


    public getDevicesByType (deviceType: number) {
        return this.getDevices().filter((device) => device.type === deviceType);
    }


    public waitForDeviceByType (deviceType: number) {
        return new Promise((resolve) => {
            const existingDevices = this.getDevicesByType(deviceType);
            if (existingDevices.length >= 1) {
                return resolve(existingDevices[0]);
            }
            this._attachCallbacks.push((device) => {
                if (device.type === deviceType) {
                    resolve(device);
                    return true;
                } else {
                    return false;
                }
            });
        });
    }


    public getPortNameForPortId (portId: number) {
        for (const port of Object.keys(this._getPortMap())) {
            if (this._getPortMap()[port] === portId) {
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


    public subscribe (portId: number, deviceType: number, mode: number) {
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
        debug(`Attached device type ${device.type} (${deviceTypeNames[device.type]}) on port ${device.portName} (${device.portId})`);

        let i = this._attachCallbacks.length;
        while (i--) {
            const callback = this._attachCallbacks[i];
            if (callback(device)) {
                this._attachCallbacks.splice(i, 1);
            }
        }
    }


    protected _detachDevice (device: Device) {
        delete this._attachedDevices[device.portId];
        /**
         * Emits when a device is detached from the Hub.
         * @event Hub#attach
         * @param {Device} device
         */
        this.emit("detach", device);
        debug(`Detached device type ${device.type} (${deviceTypeNames[device.type]}) on port ${device.portName} (${device.portId})`);
    }


    protected _createDevice (deviceType: number, portId: number, versions: DeviceVersion) {
        const constructor = devices[deviceType];

        if (constructor) {
            return new constructor(this, portId, versions);
        } else {
            return new Device(this, portId, versions, undefined);
        }

    }


    protected _getDeviceByPortId (portId: number) {
        return this._attachedDevices[portId];
    }

    protected _getPortMap() {
        return this.constructor._portMap;
    }

}
