import { Peripheral } from "@abandonware/noble";

import { IBLEAbstraction } from "../interfaces";

import { BaseHub } from "./basehub";

import * as Consts from "../consts";

import { isWebBluetooth } from "../utils";

import Debug = require("debug");
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
        super(device, WeDo2SmartHub.PortMap, Consts.HubType.WEDO2_SMART_HUB);
        debug("Discovered WeDo 2.0 Smart Hub");
    }


    public connect () {
        return new Promise(async (resolve, reject) => {
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
            this.subscribe(0x03, 0x15, 0x00); // Activate voltage reports
            this.subscribe(0x04, 0x14, 0x00); // Activate current reports
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
        return new Promise((resolve, reject) => {
            this.send(Buffer.from([0x00]), Consts.BLECharacteristic.WEDO2_DISCONNECT, () => {
                return resolve();
            });
        });
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
        return new Promise((resolve, reject) => {
            const data = Buffer.from(name, "ascii");
            // Send this twice, as sometimes the first time doesn't take
            this.send(data, Consts.BLECharacteristic.WEDO2_NAME_ID);
            this.send(data, Consts.BLECharacteristic.WEDO2_NAME_ID);
            this._name = name;
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method WeDo2SmartHub#setLEDColor
     * @param {Color} color
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x06, 0x17, 0x01, 0x01]);
            this.send(data, Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
            if (typeof color === "boolean") {
                color = 0;
            }
            data = Buffer.from([0x06, 0x04, 0x01, color]);
            this.send(data, Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via RGB values.
     * @method WeDo2SmartHub#setLEDRGB
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDRGB (red: number, green: number, blue: number) {
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x06, 0x17, 0x01, 0x02]);
            this.send(data, Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
            data = Buffer.from([0x06, 0x04, 0x03, red, green, blue]);
            this.send(data, Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            return resolve();
        });
    }


    // /**
    //  * Ramp the motor speed on a given port.
    //  * @method WeDo2SmartHub#rampMotorSpeed
    //  * @param {string} port
    //  * @param {number} fromSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
    //  * @param {number} toSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
    //  * @param {number} time How long the ramp should last (in milliseconds).
    //  * @returns {Promise} Resolved upon successful completion of command.
    //  */
    // public rampMotorSpeed (port: string, fromSpeed: number, toSpeed: number, time: number) {
    //     const portObj = this._portLookup(port);
    //     portObj.cancelEventTimer();
    //     return new Promise((resolve, reject) => {
    //         this._calculateRamp(fromSpeed, toSpeed, time, portObj)
    //         .on("changeSpeed", (speed) => {
    //             this.setMotorSpeed(port, speed, true);
    //         })
    //         .on("finished", resolve);
    //     });
    // }


    /**
     * Play a tone on the Hub's in-built buzzer
     * @method WeDo2SmartHub#playTone
     * @param {number} frequency
     * @param {number} time How long the tone should play for (in milliseconds).
     * @returns {Promise} Resolved upon successful completion of command (ie. once the tone has finished playing).
     */
    public playTone (frequency: number, time: number) {
        return new Promise((resolve, reject) => {
            const data = Buffer.from([0x05, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00]);
            data.writeUInt16LE(frequency, 3);
            data.writeUInt16LE(time, 5);
            this.send(data, Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            global.setTimeout(resolve, time);
        });
    }


    public send (message: Buffer, uuid: string, callback?: () => void) {
        if (debug.enabled) {
            debug(`Sent Message (${this._getCharacteristicNameFromUUID(uuid)})`, message);
        }
        this._bleDevice.writeToCharacteristic(uuid, message, callback);
    }


    public subscribe (portId: number, deviceType: number, mode: number) {
        this.send(Buffer.from([0x01, 0x02, portId, deviceType, mode, 0x01, 0x00, 0x00, 0x00, 0x00, 0x01]), Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
        this.send(Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x00]), Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE, callback);
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
        this._batteryLevel = data[0];
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
            this.emit("button", "GREEN", Consts.ButtonState.PRESSED);
            return;
        } else if (message[0] === 0x00) {
            this.emit("button", "GREEN", Consts.ButtonState.RELEASED);
            return;
        }

        const portId = message[1];
        const device = this._getDeviceByPortId(portId);

        if (device) {
            device.receive(message);
        }

        // if (data[0] === 0x01) {
        //     /**
        //      * Emits when a button is pressed.
        //      * @event WeDo2SmartHub#button
        //      * @param {string} button
        //      * @param {ButtonState} state
        //      */
        //     this.emit("button", "GREEN", Consts.ButtonState.PRESSED);
        //     return;
        // } else if (data[0] === 0x00) {
        //     this.emit("button", "GREEN", Consts.ButtonState.RELEASED);
        //     return;
        // }

        // // Voltage
        // if (data[1] === 0x03) {
        //     const voltage = data.readInt16LE(2);
        //     this._voltage = voltage / 40;
        // // Current
        // } else if (data[1] === 0x04) {
        //     const current = data.readInt16LE(2);
        //     this._current = current / 1000;
        // }

        // const port = this._getPortForPortNumber(data[1]);

        // if (!port) {
        //     return;
        // }

        // if (port && port.connected) {
        //     switch (port.type) {
        //         case Consts.DeviceType.COLOR_DISTANCE_SENSOR: {
        //             const distance = data[2];
        //             /**
        //              * Emits when a color sensor is activated.
        //              * @event WeDo2SmartHub#color
        //              * @param {string} port
        //              * @param {Color} color
        //              */
        //             this.emit("color", port.id, distance);
        //             break;
        //         }
        //     }
        // }

    }


}

export namespace WeDo2SmartHub {

    export const PortMap: {[portName: string]: number} = {
        "A": 1,
        "B": 2
    }

}