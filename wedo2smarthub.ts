import { Peripheral } from "noble";

import { Hub } from "./hub";
import { Port } from "./port";

import * as Consts from "./consts";

import Debug = require("debug");
import { resolve } from "path";
const debug = Debug("wedo2smarthub");


/**
 * The WeDo2SmartHub is emitted if the discovered device is a WeDo 2.0 Smart Hub.
 * @class WeDo2SmartHub
 * @extends Hub
 */
export class WeDo2SmartHub extends Hub {


    public static IsWeDo2SmartHub (peripheral: Peripheral) {
        return (peripheral.advertisement.serviceUuids.indexOf(Consts.BLEServices.WEDO2_SMART_HUB) >= 0);
    }


    private _lastTiltX: number = 0;
    private _lastTiltY: number = 0;


    constructor (peripheral: Peripheral, autoSubscribe: boolean = true) {
        super(peripheral, autoSubscribe);
        this.type = Consts.Hubs.WEDO2_SMART_HUB;
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
            this._subscribeToCharacteristic(this._characteristics[Consts.BLECharacteristics.WEDO2_PORT_TYPE], this._parsePortMessage.bind(this));
            this._subscribeToCharacteristic(this._characteristics[Consts.BLECharacteristics.WEDO2_SENSOR_VALUE], this._parseSensorMessage.bind(this));
            this._subscribeToCharacteristic(this._characteristics[Consts.BLECharacteristics.WEDO2_BUTTON], this._parseSensorMessage.bind(this));
            this._subscribeToCharacteristic(this._characteristics[Consts.BLECharacteristics.WEDO2_BATTERY], this._parseBatteryMessage.bind(this));
            this._subscribeToCharacteristic(this._characteristics[Consts.BLECharacteristics.WEDO2_HIGH_CURRENT_ALERT], this._parseHighCurrentAlert.bind(this));
            this._characteristics[Consts.BLECharacteristics.WEDO2_BATTERY].read((err, data) => {
                this._parseBatteryMessage(data);
            });
            debug("Connect completed");
            return resolve();
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
            this._writeMessage(Consts.BLECharacteristics.WEDO2_NAME_ID, data);
            this._writeMessage(Consts.BLECharacteristics.WEDO2_NAME_ID, data);
            this._name = name;
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method WeDo2SmartHub#setLEDColor
     * @param {number} color A number representing one of the LED color consts.
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x06, 0x17, 0x01, 0x01]);
            this._writeMessage(Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE, data);
            if (color === false) {
                color = 0;
            }
            data = Buffer.from([0x06, 0x04, 0x01, color]);
            this._writeMessage(Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE, data);
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
            this._writeMessage(Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE, data);
            data = Buffer.from([0x06, 0x04, 0x03, red, green, blue]);
            this._writeMessage(Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE, data);
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
            this._writeMessage(Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE, Buffer.from([portObj.value, 0x01, 0x02, this._mapSpeed(speed)]));
            if (time && typeof time === "number") {
                const timeout = global.setTimeout(() => {
                    this._writeMessage(Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE, Buffer.from([portObj.value, 0x01, 0x02, 0x00]));
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
     * Play a sound on the Hub's in-built buzzer
     * @method WeDo2SmartHub#playSound
     * @param {number} frequency
     * @param {number} time How long the sound should play for (in milliseconds).
     * @returns {Promise} Resolved upon successful completion of command (ie. once the sound has finished playing).
     */
    public playSound (frequency: number, time: number) {
        return new Promise((resolve, reject) => {
            const data = Buffer.from([0x05, 0x02, 0x04, 0x00, 0x00, 0x00, 0x00]);
            data.writeUInt16LE(frequency, 3);
            data.writeUInt16LE(time, 5);
            this._writeMessage(Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE, data);
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
            this._writeMessage(Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE, data);
            if (time) {
                const timeout = global.setTimeout(() => {
                    const data = Buffer.from([portObj.value, 0x01, 0x02, 0x00]);
                    this._writeMessage(Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE, data);
                    return resolve();
                }, time);
                portObj.setEventTimer(timeout);
            } else {
                return resolve();
            }
        });
    }


    protected _activatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
            this._writeMessage(Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE, Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x01]), callback);
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
        this._writeMessage(Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE, Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x00]), callback);
    }


    private _writeMessage (uuid: string, message: Buffer, callback?: () => void) {
        const characteristic = this._characteristics[uuid];
        if (characteristic) {
            characteristic.write(message, false, callback);
        }
    }


    private _parseHighCurrentAlert (data: Buffer) {
        // console.log(data);
    }


    private _parseBatteryMessage (data: Buffer) {
        this._batteryLevel = data[0];
    }


    private _parsePortMessage (data: Buffer) {

        const port = this._getPortForPortNumber(data[0]);

        if (!port) {
            return;
        }

        port.connected = data[1] === 1 ? true : false;
        this._registerDeviceAttachment(port, data[3]);

    }


    private _parseSensorMessage (data: Buffer) {


        if (data[0] === 0x01) {
            /**
             * Emits when a button is pressed.
             * @event WeDo2SmartHub#button
             * @param {string} button
             * @param {number} state A number representing one of the button state consts.
             */
            this.emit("button", "GREEN", Consts.ButtonStates.PRESSED);
            return;
        } else if (data[0] === 0x00) {
            this.emit("button", "GREEN", Consts.ButtonStates.RELEASED);
            return;
        }

        const port = this._getPortForPortNumber(data[1]);

        if (!port) {
            return;
        }

        if (port && port.connected) {
            switch (port.type) {
                case Consts.Devices.WEDO2_DISTANCE:
                {
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
                case Consts.Devices.BOOST_DISTANCE:
                {
                    const distance = data[2];
                    /**
                     * Emits when a color sensor is activated.
                     * @event WeDo2SmartHub#color
                     * @param {string} port
                     * @param {number} color A number representing one of the LED color consts.
                     */
                    this.emit("color", port.id, distance);
                    break;
                }
                case Consts.Devices.WEDO2_TILT:
                {
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
                case Consts.Devices.BOOST_TACHO_MOTOR:
                {
                    const rotation = data.readInt32LE(2);
                    /**
                     * Emits when a rotation sensor is activated.
                     * @event WeDo2SmartHub#rotate
                     * @param {string} port
                     * @param {number} rotation
                     */
                    this.emit("rotate", port.id, rotation);
                }
            }
        }

    }


}
