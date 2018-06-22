import { Peripheral } from "noble";

import { Hub } from "./hub.js";
import { Port } from "./port.js";

import * as Consts from "./consts";

import Debug = require("debug");
const debug = Debug("wedo2hub");


/**
 * @class WeDo2Hub
 * @extends Hub
 */
export class WeDo2Hub extends Hub {


    public static IsWeDo2Hub (peripheral: Peripheral) {
        return (peripheral.advertisement.localName === Consts.BLENames.WEDO2_SMART_HUB_NAME && peripheral.advertisement.serviceUuids.indexOf(Consts.BLEServices.WEDO2_SMART_HUB) >= 0);
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
            debug("Connect completed");
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method WeDo2Hub#setLEDColor
     * @param {number} color A number representing one of the LED color consts.
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            const motorCharacteristic = this._characteristics[Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE];
            const portCharacteristic = this._characteristics[Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE];
            if (motorCharacteristic && portCharacteristic) {
                let data = Buffer.from([0x06, 0x17, 0x01, 0x01]);
                portCharacteristic.write(data, false);
                if (color === false) {
                    color = 0;
                }
                data = Buffer.from([0x06, 0x04, 0x01, color]);
                motorCharacteristic.write(data, false);
                return resolve();
            }
        });
    }


    /**
     * Set the color of the LED on the Hub via RGB values.
     * @method WeDo2Hub#setLEDRGB
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDRGB (red: number, green: number, blue: number) {
        return new Promise((resolve, reject) => {
            const motorCharacteristic = this._characteristics[Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE];
            const portCharacteristic = this._characteristics[Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE];
            if (motorCharacteristic && portCharacteristic) {
                const data1 = Buffer.from([0x01, 0x02, 0x06, 0x17, 0x01, 0x02]);
                portCharacteristic.write(data1, false);
                const data2 = Buffer.from([0x06, 0x04, 0x03, red, green, blue]);
                motorCharacteristic.write(data2, false);
                return resolve();
            }
        });
    }


    /**
     * Set the motor speed on a given port.
     * @method WeDo2Hub#setMotorSpeed
     * @param {string} port
     * @param {number} speed For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0.
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setMotorSpeed (port: string, speed: number) {
        return new Promise((resolve, reject) => {
            const characteristic = this._characteristics[Consts.BLECharacteristics.WEDO2_MOTOR_VALUE_WRITE];
            if (characteristic) {
                characteristic.write(Buffer.from([this._ports[port].value, 0x01, 0x02, speed]), false);
                return resolve();
            }
        });
    }


    protected _activatePortDevice (port: number, type: number, mode: number, format: number, callback: () => void) {
        const characteristic = this._characteristics[Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE];
        if (characteristic) {
            characteristic.write(Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x01]), false, callback);
        }
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback: () => void) {
        const characteristic = this._characteristics[Consts.BLECharacteristics.WEDO2_PORT_TYPE_WRITE];
        if (characteristic) {
            characteristic.write(Buffer.from([0x01, 0x02, port, type, mode, 0x01, 0x00, 0x00, 0x00, format, 0x00]), false, callback);
        }
    }


    private _getPortForPortNumber (num: number) {

        let port = null;

        if (num === 1) {
            port = this._ports["A"];
        } else if (num === 2) {
            port = this._ports["B"];
        } else {
            return;
        }

        return port;

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


        if (data[0] === 1) {
            /**
             * Emits when a button is pressed.
             * @event WeDo2Hub#button
             * @param {string} button
             * @param {number} state A number representing one of the button state consts.
             */
            this.emit("button", "GREEN", Consts.ButtonStates.PRESSED);
            return;
        } else if (data[0] === 0) {
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
                     * @event WeDo2Hub#distance
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
                     * @event WeDo2Hub#color
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
                     * @event WeDo2Hub#tilt
                     * @param {string} port
                     * @param {number} x
                     * @param {number} y
                     */
                    this.emit("tilt", port.id, this._lastTiltX, this._lastTiltY);
                    break;
                }
                case Consts.Devices.BOOST_INTERACTIVE_MOTOR:
                {
                    const rotation = data.readInt32LE(2);
                    /**
                     * Emits when a rotation sensor is activated.
                     * @event WeDo2Hub#rotate
                     * @param {string} port
                     * @param {number} rotation
                     */
                    this.emit("rotate", port.id, rotation);
                }
            }
        }

    }


}
