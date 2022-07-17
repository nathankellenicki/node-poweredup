import { Peripheral } from "@abandonware/noble";

import { IBLEAbstraction } from "../interfaces";

import { BaseHub } from "./basehub";

import * as Consts from "../consts";

import { isWebBluetooth } from "../utils";

import Debug = require("debug");
import { HubLED } from "../devices/hubled";
const debug = Debug("wedo2smarthub");


/**
 * The WeDo2SmartHub is emitted if the discovered device is a WeDo 2.0 Smart Hub.
 * @class WeDo2SmartHub
 * @extends BaseHub
 */
export class WeDo2SmartHub extends BaseHub {


    public static IsWeDo2SmartHub (peripheral: Peripheral) {
        return (
            peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.WEDO2_SMART_HUB.replace(/-/g, "")) >= 0
        );
    }


    private _lastTiltX: number = 0;
    private _lastTiltY: number = 0;


    constructor (device: IBLEAbstraction) {
        super(device, PortMap, Consts.HubType.WEDO2_SMART_HUB);
        debug("Discovered WeDo 2.0 Smart Hub");
    }


    public connect () {
        return new Promise<void>(async (resolve) => {
            debug("Connecting to WeDo 2.0 Smart Hub");
            await super.connect();
            await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.WEDO2_SMART_HUB);
            await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.WEDO2_SMART_HUB_2);
            if (!isWebBluetooth) {
                await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.WEDO2_SMART_HUB_3);
                await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.WEDO2_SMART_HUB_4);
                await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.WEDO2_SMART_HUB_5);
            } else {
                await this._bleDevice.discoverCharacteristicsForService("battery_service");
                await this._bleDevice.discoverCharacteristicsForService("device_information");
            }
            debug("Connect completed");
            this.emit("connect");
            resolve();
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.WEDO2_PORT_TYPE, this._parsePortMessage.bind(this));
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.WEDO2_SENSOR_VALUE, this._parseSensorMessage.bind(this));
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.WEDO2_BUTTON, this._parseSensorMessage.bind(this));
            if (!isWebBluetooth) {
                this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.WEDO2_BATTERY, this._parseBatteryMessage.bind(this));
                this._bleDevice.readFromCharacteristic(Consts.BLECharacteristic.WEDO2_BATTERY, (err, data) => {
                    if (data) {
                        this._parseBatteryMessage(data);
                    }
                });
            } else {
                this._bleDevice.readFromCharacteristic("00002a19-0000-1000-8000-00805f9b34fb", (err, data) => {
                    if (data) {
                        this._parseBatteryMessage(data);
                    }
                });
                this._bleDevice.subscribeToCharacteristic("00002a19-0000-1000-8000-00805f9b34fb", this._parseHighCurrentAlert.bind(this));
            }
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.WEDO2_HIGH_CURRENT_ALERT, this._parseHighCurrentAlert.bind(this));
            if (!isWebBluetooth) {
                this._bleDevice.readFromCharacteristic(Consts.BLECharacteristic.WEDO2_FIRMWARE_REVISION, (err, data) => {
                    if (data) {
                        this._parseFirmwareRevisionString(data);
                    }
                });
            } else {
                this._bleDevice.readFromCharacteristic("00002a26-0000-1000-8000-00805f9b34fb", (err, data) => {
                    if (data) {
                        this._parseFirmwareRevisionString(data);
                    }
                });
            }
        });
    }


    /**
     * Shutdown the Hub.
     * @method WeDo2SmartHub#shutdown
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public shutdown () {
        return this.send(Buffer.from([0x00]), Consts.BLECharacteristic.WEDO2_DISCONNECT);
    }


    /**
     * Set the name of the Hub.
     * @method WeDo2SmartHub#setName
     * @param {string} name New name of the hub (14 characters or less, ASCII only).
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setName (name: string) {
        if (name.length > 14) {
            throw new Error("Name must be 14 characters or less");
        }
        return new Promise<void>((resolve) => {
            const data = Buffer.from(name, "ascii");
            // Send this twice, as sometimes the first time doesn't take
            this.send(data, Consts.BLECharacteristic.WEDO2_NAME_ID);
            this.send(data, Consts.BLECharacteristic.WEDO2_NAME_ID);
            this._name = name;
            return resolve();
        });
    }


    public send (message: Buffer, uuid: string) {
        if (debug.enabled) {
            debug(`Sent Message (${this._getCharacteristicNameFromUUID(uuid)})`, message);
        }
        return this._bleDevice.writeToCharacteristic(uuid, message);
    }


    public subscribe (portId: number, deviceType: number, mode: number) {
        this.send(Buffer.from([0x01, 0x02, portId, deviceType, mode, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01]), Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
    }


    public unsubscribe (portId: number, deviceType: number, mode: number) {
        this.send(Buffer.from([0x01, 0x02, portId, deviceType, mode, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]), Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
    }


    private _getCharacteristicNameFromUUID (uuid: string) {
        const keys = Object.keys(Consts.BLECharacteristic);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (Consts.BLECharacteristic[key as keyof typeof Consts.BLECharacteristic] === uuid) {
                return key;
            }
        }
        return "UNKNOWN";
    }


    private _parseHighCurrentAlert (data: Buffer) {
        debug("Received Message (WEDO2_HIGH_CURRENT_ALERT)", data);
    }


    private _parseBatteryMessage (data: Buffer) {
        debug("Received Message (WEDO2_BATTERY)", data);
        const batteryLevel = data[0];
        if (batteryLevel !== this._batteryLevel) {
            this._batteryLevel = batteryLevel;
            this.emit("batteryLevel", { batteryLevel });
        }
    }


    private _parseFirmwareRevisionString (data: Buffer) {
        debug("Received Message (WEDO2_FIRMWARE_REVISION)", data);
        this._firmwareVersion = data.toString();
    }


    private _parsePortMessage (data: Buffer) {
        debug("Received Message (WEDO2_PORT_TYPE)", data);

        const portId = data[0];
        const event = data[1];
        const deviceType = event ? data[3] : 0;

        if (event === 0x01) {
            const device = this._createDevice(deviceType, portId);
            this._attachDevice(device);
        } else if (event === 0x00) {
            const device = this._getDeviceByPortId(portId);
            if (device) {
                this._detachDevice(device);
            }
        }
    }


    private _parseSensorMessage (message: Buffer) {

        debug("Received Message (WEDO2_SENSOR_VALUE)", message);

        if (message[0] === 0x01) {
            /**
             * Emits when a button is pressed.
             * @event WeDo2SmartHub#button
             * @param {string} button
             * @param {ButtonState} state
             */
            this.emit("button", { event: Consts.ButtonState.PRESSED });
            return;
        } else if (message[0] === 0x00) {
            this.emit("button", { event: Consts.ButtonState.RELEASED });
            return;
        }

        const portId = message[1];
        const device = this._getDeviceByPortId(portId);

        if (device) {
            device.receive(message);
        }

    }


}

export const PortMap: {[portName: string]: number} = {
    "A": 1,
    "B": 2,
    "CURRENT_SENSOR": 3,
    "VOLTAGE_SENSOR": 4,
    "PIEZO_BUZZER": 5,
    "HUB_LED": 6
};
