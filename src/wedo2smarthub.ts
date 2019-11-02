import { Peripheral } from "noble";

import { Hub } from "./hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
import { IBLEDevice } from "./interfaces";
import { isWebBluetooth } from "./utils";
const debug = Debug("wedo2smarthub");


/**
 * The WeDo2SmartHub is emitted if the discovered device is a WeDo 2.0 Smart Hub.
 * @class WeDo2SmartHub
 * @extends Hub
 */
export class WeDo2SmartHub extends Hub {


    public static IsWeDo2SmartHub (peripheral: Peripheral) {
        return (peripheral.advertisement &&
            peripheral.advertisement.serviceUuids &&
            peripheral.advertisement.serviceUuids.indexOf(Consts.BLEService.WEDO2_SMART_HUB.replace(/-/g, "")) >= 0);
    }


    private _lastTiltX: number = 0;
    private _lastTiltY: number = 0;


    constructor (device: IBLEDevice, autoSubscribe: boolean = true) {
        super(device, autoSubscribe);
        this.type = Consts.HubType.WEDO2_SMART_HUB;
        this._ports = {
            "A": new Port("A", 1),
            "B": new Port("B", 2)
        };
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
            this._activatePortDevice(0x03, 0x15, 0x00, 0x00); // Activate voltage reports
            this._activatePortDevice(0x04, 0x14, 0x00, 0x00); // Activate current reports
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
            this._writeMessage(Consts.BLECharacteristic.WEDO2_NAME_ID, data);
            this._writeMessage(Consts.BLECharacteristic.WEDO2_NAME_ID, data);
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
            this._writeMessage(Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE, data);
            if (typeof color === "boolean") {
                color = 0;
            }
            data = Buffer.from([0x06, 0x04, 0x01, color]);
            this._writeMessage(Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE, data);
            return resolve();
        });
    }


    /**
     * Shutdown the Hub.
     * @method WeDo2SmartHub#shutdown
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public shutdown () {
        return new Promise((resolve, reject) => {
            this._writeMessage(Consts.BLECharacteristic.WEDO2_DISCONNECT, Buffer.from([0x00]), () => {
                return resolve();
            });
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
            this._writeMessage(Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE, data);
            data = Buffer.from([0x06, 0x04, 0x03, red, green, blue]);
            this._writeMessage(Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE, data);
            return resolve();
        });
    }


    /**
     * Set the motor speed on a given port.
     * @method WeDo2SmartHub#setMotorSpeed
     * @param {string} port
     * @param {number} speed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} [time] How long to activate the motor for (in milliseconds). Leave empty to turn the motor on indefinitely.
     * @returns {Promise} Resolved upon successful completion of command. If time is specified, this is once the motor is finished.
     */
    public setMotorSpeed (port: string, speed: number, time?: number | boolean) {
        const portObj = this._portLookup(port);
        let cancelEventTimer = true;
        if (typeof time === "boolean") {
            if (time === true) {
                cancelEventTimer = false;
            }
            time = undefined;
        }
        if (cancelEventTimer) {
            portObj.cancelEventTimer();
        }
        return new Promise((resolve, reject) => {
            this._writeMessage(Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE, Buffer.from([portObj.value, 0x01, 0x02, this._mapSpeed(speed)]));
            if (time && typeof time === "number") {
                const timeout = global.setTimeout(() => {
                    this._writeMessage(Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE, Buffer.from([portObj.value, 0x01, 0x02, 0x00]));
                    return resolve();
                }, time);
                portObj.setEventTimer(timeout);
            } else {
                return resolve();
            }
        });
    }


    /**
     * Ramp the motor speed on a given port.
     * @method WeDo2SmartHub#rampMotorSpeed
     * @param {string} port
     * @param {number} fromSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} toSpeed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @param {number} time How long the ramp should last (in milliseconds).
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public rampMotorSpeed (port: string, fromSpeed: number, toSpeed: number, time: number) {
        const portObj = this._portLookup(port);
        portObj.cancelEventTimer();
        return new Promise((resolve, reject) => {
            this._calculateRamp(fromSpeed, toSpeed, time, portObj)
            .on("changeSpeed", (speed) => {
                this.setMotorSpeed(port, speed, true);
            })
            .on("finished", resolve);
        });
    }


    /**
     * Fully (hard) stop the motor on a given port.
     * @method WeDo2SmartHub#brakeMotor
     * @param {string} port
     * @returns {Promise} Resolved upon successful completion of command.
     */
    public brakeMotor (port: string) {
        return this.setMotorSpeed(port, 127);
    }


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
            this._writeMessage(Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE, data);
            global.setTimeout(resolve, time);
        });
    }


    /**
     * Set the light brightness on a given port.
     * @method WeDo2SmartHub#setLightBrightness
     * @param {string} port
     * @param {number} brightness Brightness value between 0-100 (0 is off)
     * @param {number} [time] How long to turn the light on (in milliseconds). Leave empty to turn the light on indefinitely.
     * @returns {Promise} Resolved upon successful completion of command. If time is specified, this is once the light is turned off.
     */
    public setLightBrightness (port: string, brightness: number, time?: number) {
        const portObj = this._portLookup(port);
        portObj.cancelEventTimer();
        return new Promise((resolve, reject) => {
            const data = Buffer.from([portObj.value, 0x01, 0x02, brightness]);
            this._writeMessage(Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE, data);
            if (time) {
                const timeout = global.setTimeout(() => {
                    const data = Buffer.from([portObj.value, 0x01, 0x02, 0x00]);
                    this._writeMessage(Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE, data);
                    return resolve();
                }, time);
                portObj.setEventTimer(timeout);
            } else {
                return resolve();
            }
        });
    }


    public sendRaw (message: Buffer, characteristic: string = Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE) {
        return new Promise((resolve, reject) => {
            this._writeMessage(characteristic, message, () => {
                return resolve();
            });
        });
    }


    protected _activatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
            this._writeMessage(Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE, Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x01]), callback);
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
        this._writeMessage(Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE, Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x00]), callback);
    }


    private _writeMessage (uuid: string, message: Buffer, callback?: () => void) {
        if (debug.enabled) {
            debug(`Sent Message (${this._getCharacteristicNameFromUUID(uuid)})`, message);
        }
        this._bleDevice.writeToCharacteristic(uuid, message, callback);
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
        const parts = data.toString().split(".");
        this._firmwareInfo = { major: parseInt(parts[0], 10), minor: parseInt(parts[1], 10), bugFix: parseInt(parts[2], 10), build: parseInt(parts[3], 10) };
    }


    private _parsePortMessage (data: Buffer) {

        debug("Received Message (WEDO2_PORT_TYPE)", data);

        const port = this._getPortForPortNumber(data[0]);

        if (!port) {
            return;
        }

        port.connected = data[1] === 1 ? true : false;
        this._registerDeviceAttachment(port, data[3]);

    }


    private _parseSensorMessage (data: Buffer) {

        debug("Received Message (WEDO2_SENSOR_VALUE)", data);

        if (data[0] === 0x01) {
            /**
             * Emits when a button is pressed.
             * @event WeDo2SmartHub#button
             * @param {string} button
             * @param {ButtonState} state
             */
            this.emit("button", "GREEN", Consts.ButtonState.PRESSED);
            return;
        } else if (data[0] === 0x00) {
            this.emit("button", "GREEN", Consts.ButtonState.RELEASED);
            return;
        }

        // Voltage
        if (data[1] === 0x03) {
            const voltage = data.readInt16LE(2);
            this._voltage = voltage / 40;
        // Current
        } else if (data[1] === 0x04) {
            const current = data.readInt16LE(2);
            this._current = current / 1000;
        }

        const port = this._getPortForPortNumber(data[1]);

        if (!port) {
            return;
        }

        if (port && port.connected) {
            switch (port.type) {
                case Consts.DeviceType.WEDO2_DISTANCE: {
                    let distance = data[2];
                    if (data[3] === 1) {
                        distance = data[2] + 255;
                    }
                    /**
                     * Emits when a distance sensor is activated.
                     * @event WeDo2SmartHub#distance
                     * @param {string} port
                     * @param {number} distance Distance, in millimeters.
                     */
                    this.emit("distance", port.id, distance * 10);
                    break;
                }
                case Consts.DeviceType.BOOST_DISTANCE: {
                    const distance = data[2];
                    /**
                     * Emits when a color sensor is activated.
                     * @event WeDo2SmartHub#color
                     * @param {string} port
                     * @param {Color} color
                     */
                    this.emit("color", port.id, distance);
                    break;
                }
                case Consts.DeviceType.WEDO2_TILT: {
                    this._lastTiltX = data[2];
                    if (this._lastTiltX > 100) {
                        this._lastTiltX = -(255 - this._lastTiltX);
                    }
                    this._lastTiltY = data[3];
                    if (this._lastTiltY > 100) {
                        this._lastTiltY = -(255 - this._lastTiltY);
                    }
                    /**
                     * Emits when a tilt sensor is activated.
                     * @event WeDo2SmartHub#tilt
                     * @param {string} port
                     * @param {number} x
                     * @param {number} y
                     */
                    this.emit("tilt", port.id, this._lastTiltX, this._lastTiltY);
                    break;
                }
                case Consts.DeviceType.BOOST_TACHO_MOTOR: {
                    const rotation = data.readInt32LE(2);
                    /**
                     * Emits when a rotation sensor is activated.
                     * @event WeDo2SmartHub#rotate
                     * @param {string} port
                     * @param {number} rotation
                     */
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.DeviceType.CONTROL_PLUS_LARGE_MOTOR: {
                    const rotation = data.readInt32LE(2);
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.DeviceType.CONTROL_PLUS_XLARGE_MOTOR: {
                    const rotation = data.readInt32LE(2);
                    this.emit("rotate", port.id, rotation);
                    break;
                }
            }
        }

    }


}
