import { Peripheral } from "@abandonware/noble";

import { Hub } from "./hub";
import { Port } from "./port";

import * as Consts from "./consts";
import { toBin, toHex } from "./utils";

import Debug = require("debug");
const debug = Debug("lpf2hub");
const modeInfoDebug = Debug("lpf2hubmodeinfo");


/**
 * @class LPF2Hub
 * @extends Hub
 */
export class LPF2Hub extends Hub {
    private static decodeVersion(v: number) {
        const t = v.toString(16).padStart(8, "0");
        return [t[0], t[1], t.substring(2, 4), t.substring(4)].join(".");
    }

    private static decodeMACAddress(v: Uint8Array) {
        return Array.from(v).map((n) => toHex(n, 2)).join(":");
    }

    protected _ledPort: number = 0x32;
    protected _voltagePort: number | undefined;
    protected _voltageMaxV: number = 9.6;
    protected _voltageMaxRaw: number = 3893;
    protected _currentPort: number | undefined;
    protected _currentMaxMA: number = 2444;
    protected _currentMaxRaw: number = 4095;

    private _lastTiltX: number = 0;
    private _lastTiltY: number = 0;
    private _lastTiltZ: number = 0;

    private _messageBuffer: Buffer = Buffer.alloc(0);


    public connect () {
        return new Promise(async (resolve, reject) => {
            await super.connect();
            await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.LPF2_HUB);
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.LPF2_ALL, this._parseMessage.bind(this));
            if (this._voltagePort !== undefined) {
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, this._voltagePort, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01])); // Activate voltage reports
            }
            if (this._currentPort !== undefined) {
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, this._currentPort, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01])); // Activate current reports
            }
            if (this.type === Consts.HubType.DUPLO_TRAIN_HUB) {
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x01]));
            }
            await this.sleep(100);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x02, 0x02])); // Activate button reports
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x03, 0x05])); // Request firmware version
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x04, 0x05])); // Request hardware version
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x05, 0x02])); // Activate RSSI updates
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x06, 0x02])); // Activate battery level reports
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x0d, 0x05])); // Request primary MAC address
            this.emit("connect");
            resolve();
        });
    }


    /**
     * Shutdown the Hub.
     * @method LPF2Hub#shutdown
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public shutdown () {
        return new Promise((resolve, reject) => {
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x02, 0x01]), () => {
                return resolve();
            });
        });
    }


    /**
     * Set the name of the Hub.
     * @method LPF2Hub#setName
     * @param {string} name New name of the hub (14 characters or less, ASCII only).
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setName (name: string) {
        if (name.length > 14) {
            throw new Error("Name must be 14 characters or less");
        }
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x01, 0x01, 0x01]);
            data = Buffer.concat([data, Buffer.from(name, "ascii")]);
            // Send this twice, as sometimes the first time doesn't take
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            this._name = name;
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via a color value.
     * @method LPF2Hub#setLEDColor
     * @param {Color} color
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDColor (color: number | boolean) {
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x41, this._ledPort, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            if (typeof color === "boolean") {
                color = 0;
            }
            data = Buffer.from([0x81, this._ledPort, 0x11, 0x51, 0x00, color]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            return resolve();
        });
    }


    /**
     * Set the color of the LED on the Hub via RGB values.
     * @method LPF2Hub#setLEDRGB
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public setLEDRGB (red: number, green: number, blue: number) {
        return new Promise((resolve, reject) => {
            let data = Buffer.from([0x41, this._ledPort, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            data = Buffer.from([0x81, this._ledPort, 0x11, 0x51, 0x01, red, green, blue]);
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, data);
            return resolve();
        });
    }


    public sendRaw (message: Buffer) {
        return new Promise((resolve, reject) => {
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, message, () => {
                return resolve();
            });
        });
    }


    protected _activatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
        this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), callback);
    }


    protected _deactivatePortDevice (port: number, type: number, mode: number, format: number, callback?: () => void) {
        this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, port, mode, 0x01, 0x00, 0x00, 0x00, 0x00]), callback);
    }


    protected _writeMessage (uuid: string, message: Buffer, callback?: () => void) {
        message = Buffer.concat([Buffer.alloc(2), message]);
        message[0] = message.length;
        debug("Sent Message (LPF2_ALL)", message);
        this._bleDevice.writeToCharacteristic(uuid, message, callback);
    }


    protected _combinePorts (port: string, type: number) {
        if (!this._ports[port]) {
            return;
        }
        const portObj = this._portLookup(port);
        if (portObj) {
            Object.keys(this._ports).forEach((id) => {
                if (this._ports[id].type === type && this._ports[id].value !== portObj.value && !this._virtualPorts[`${portObj.value < this._ports[id].value ? portObj.id : this._ports[id].id}${portObj.value > this._ports[id].value ? portObj.id : this._ports[id].id}`]) {
                    debug("Combining ports", portObj.value < this._ports[id].value ? portObj.id : id, portObj.value > this._ports[id].value ? portObj.id : id);
                    this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x61, 0x01, portObj.value < this._ports[id].value ? portObj.value : this._ports[id].value, portObj.value > this._ports[id].value ? portObj.value : this._ports[id].value]));
                }
            });
        }
    }


    protected _checkFirmware (version: string) {
        return;
    }


    private _parseMessage (data?: Buffer) {

        if (data) {
            this._messageBuffer = Buffer.concat([this._messageBuffer, data]);
        }

        if (this._messageBuffer.length <= 0) {
            return;
        }

        const len = this._messageBuffer[0];
        if (len >= this._messageBuffer.length) {

            const message = this._messageBuffer.slice(0, len);
            this._messageBuffer = this._messageBuffer.slice(len);

            debug("Received Message (LPF2_ALL)", message);

            switch (message[2]) {
                case 0x01: {
                    this._parseDeviceInfo(message);
                    break;
                }
                case 0x04: {
                    this._parsePortMessage(message);
                    break;
                }
                case 0x43: {
                    this._parsePortInformationResponse(message);
                    break;
                }
                case 0x44: {
                    this._parseModeInformationResponse(message);
                    break;
                }
                case 0x45: {
                    this._parseSensorMessage(message);
                    break;
                }
                case 0x82: {
                    this._parsePortAction(message);
                    break;
                }
            }

            if (this._messageBuffer.length > 0) {
                this._parseMessage();
            }

        }
    }


    private _parseDeviceInfo (data: Buffer) {

        // Button press reports
        if (data[3] === 0x02) {
            if (data[5] === 1) {
                /**
                 * Emits when a button is pressed.
                 * @event LPF2Hub#button
                 * @param {string} button
                 * @param {ButtonState} state
                 */
                this.emit("button", "GREEN", Consts.ButtonState.PRESSED);
                return;
            } else if (data[5] === 0) {
                this.emit("button", "GREEN", Consts.ButtonState.RELEASED);
                return;
            }

        // Firmware version
        } else if (data[3] === 0x03) {
            this._firmwareVersion = LPF2Hub.decodeVersion(data.readInt32LE(5));
            this._checkFirmware(this._firmwareVersion);

        // Hardware version
        } else if (data[3] === 0x04) {
            this._hardwareVersion = LPF2Hub.decodeVersion(data.readInt32LE(5));

        // RSSI update
        } else if (data[3] === 0x05) {
            const rssi = data.readInt8(5);
            if (rssi !== 0) {
                this._rssi = rssi;
                this.emit("rssiChange", this._rssi);
            }

        // primary MAC Address
        } else if (data[3] === 0x0d) {
            this._primaryMACAddress = LPF2Hub.decodeMACAddress(data.slice(4, 10));

        // Battery level reports
        } else if (data[3] === 0x06) {
            this._batteryLevel = data[5];
        }

    }

    private _parsePortMessage (data: Buffer) {

        let port = this._getPortForPortNumber(data[3]);
        const type = data[4] ? data.readUInt16LE(5) : 0;

        if (data[4] === 0x01 && modeInfoDebug.enabled) {
            const typeName = Consts.DeviceTypeNames[data[5]] || "unknown";
            modeInfoDebug(`Port ${toHex(data[3])}, type ${toHex(type, 4)} (${typeName})`);
            const hwVersion = LPF2Hub.decodeVersion(data.readInt32LE(7));
            const swVersion = LPF2Hub.decodeVersion(data.readInt32LE(11));
            modeInfoDebug(`Port ${toHex(data[3])}, hardware version ${hwVersion}, software version ${swVersion}`);
            this._sendPortInformationRequest(data[3]);
        }

        if (!port) {
            if (data[4] === 0x02) {
                const portA = this._getPortForPortNumber(data[7]);
                const portB = this._getPortForPortNumber(data[8]);
                if (portA && portB) {
                    this._virtualPorts[`${portA.id}${portB.id}`] = new Port(`${portA.id}${portB.id}`, data[3]);
                    port = this._getPortForPortNumber(data[3]);
                    if (port) {
                        port.connected = true;
                        this._registerDeviceAttachment(port, type);
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            } else {
                return;
            }
        } else {
            port.connected = (data[4] === 0x01 || data[4] === 0x02) ? true : false;
            this._registerDeviceAttachment(port, type);
        }

    }


    private _sendPortInformationRequest (port: number) {
        this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x21, port, 0x01]));
        this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x21, port, 0x02])); // Mode combinations
    }


    private _parsePortInformationResponse (data: Buffer) {
        const port = data[3];
        if (data[4] === 2) {
            const modeCombinationMasks: number[] = [];
            for (let i = 5; i < data.length; i += 2) {
                modeCombinationMasks.push(data.readUInt16LE(i));
            }
            modeInfoDebug(`Port ${toHex(port)}, mode combinations [${modeCombinationMasks.map((c) => toBin(c, 0)).join(", ")}]`);
            return;
        }
        const count = data[6];
        const input = toBin(data.readUInt16LE(7), count);
        const output = toBin(data.readUInt16LE(9), count);
        modeInfoDebug(`Port ${toHex(port)}, total modes ${count}, input modes ${input}, output modes ${output}`);

        for (let i = 0; i < count; i++) {
            this._sendModeInformationRequest(port, i, 0x00); // Mode Name
            this._sendModeInformationRequest(port, i, 0x01); // RAW Range
            this._sendModeInformationRequest(port, i, 0x02); // PCT Range
            this._sendModeInformationRequest(port, i, 0x03); // SI Range
            this._sendModeInformationRequest(port, i, 0x04); // SI Symbol
            this._sendModeInformationRequest(port, i, 0x80); // Value Format
        }
    }


    private _sendModeInformationRequest (port: number, mode: number, type: number) {
        this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x22, port, mode, type]));
    }


    private _parseModeInformationResponse (data: Buffer) {
        const port = toHex(data[3]);
        const mode = data[4];
        const type = data[5];
        switch (type) {
            case 0x00: // Mode Name
                modeInfoDebug(`Port ${port}, mode ${mode}, name ${data.slice(6, data.length).toString()}`);
                break;
            case 0x01: // RAW Range
                modeInfoDebug(`Port ${port}, mode ${mode}, RAW min ${data.readFloatLE(6)}, max ${data.readFloatLE(10)}`);
                break;
            case 0x02: // PCT Range
                modeInfoDebug(`Port ${port}, mode ${mode}, PCT min ${data.readFloatLE(6)}, max ${data.readFloatLE(10)}`);
                break;
            case 0x03: // SI Range
                modeInfoDebug(`Port ${port}, mode ${mode}, SI min ${data.readFloatLE(6)}, max ${data.readFloatLE(10)}`);
                break;
            case 0x04: // SI Symbol
                modeInfoDebug(`Port ${port}, mode ${mode}, SI symbol ${data.slice(6, data.length).toString()}`);
                break;
            case 0x80: // Value Format
                const numValues = data[6];
                const dataType = ["8bit", "16bit", "32bit", "float"][data[7]];
                const totalFigures = data[8];
                const decimals = data[9];
                modeInfoDebug(`Port ${port}, mode ${mode}, Value ${numValues} x ${dataType}, Decimal format ${totalFigures}.${decimals}`);
        }
    }


    private _parsePortAction (data: Buffer) {

        const port = this._getPortForPortNumber(data[3]);

        if (!port) {
            return;
        }

        if (data[4] === 0x0a) {
            port.busy = false;
            if (port.finished) {
                port.finished();
                port.finished = null;
            }
        }

    }


    private _parseSensorMessage (data: Buffer) {

        if (data[3] === this._voltagePort) {
            const voltageRaw = data.readUInt16LE(4);
            this._voltage = voltageRaw * this._voltageMaxV / this._voltageMaxRaw;
            return;
        } else if (data[3] === this._currentPort) {
            const currentRaw = data.readUInt16LE(4);
            this._current = this._currentMaxMA * currentRaw / this._currentMaxRaw;
            return;
        }

        if ((data[3] === 0x3d && this.type === Consts.HubType.CONTROL_PLUS_HUB)) { // Control+ CPU Temperature
            /**
             * Emits when a change is detected on a temperature sensor. Measured in degrees centigrade.
             * @event LPF2Hub#temp
             * @param {string} port For Control+ Hubs, port will be "CPU" as the sensor reports CPU temperature.
             * @param {number} temp
             */
            this.emit("temp", "CPU", ((data.readInt16LE(4) / 900) * 90).toFixed(2));
            return;
        }

        const port = this._getPortForPortNumber(data[3]);

        if (!port) {
            return;
        }

        if (port && port.connected) {
            switch (port.type) {
                case Consts.DeviceType.WEDO2_DISTANCE: {
                    let distance = data[4];
                    if (data[5] === 1) {
                        distance = data[4] + 255;
                    }
                    /**
                     * Emits when a distance sensor is activated.
                     * @event LPF2Hub#distance
                     * @param {string} port
                     * @param {number} distance Distance, in millimeters.
                     */
                    this.emit("distance", port.id, distance * 10);
                    break;
                }
                case Consts.DeviceType.BOOST_DISTANCE: {

                    /**
                     * Emits when a color sensor is activated.
                     * @event LPF2Hub#color
                     * @param {string} port
                     * @param {Color} color
                     */
                    if (data[4] <= 10) {
                        this.emit("color", port.id, data[4]);
                    }

                    let distance = data[5];
                    const partial = data[7];

                    if (partial > 0) {
                        distance += 1.0 / partial;
                    }

                    distance = Math.floor(distance * 25.4) - 20;

                    this.emit("distance", port.id, distance);

                    /**
                     * A combined color and distance event, emits when the sensor is activated.
                     * @event LPF2Hub#colorAndDistance
                     * @param {string} port
                     * @param {Color} color
                     * @param {number} distance Distance, in millimeters.
                     */
                    if (data[4] <= 10) {
                        this.emit("colorAndDistance", port.id, data[4], distance);
                    }
                    break;
                }
                case Consts.DeviceType.WEDO2_TILT: {
                    const tiltX = data.readInt8(4);
                    const tiltY = data.readInt8(5);
                    this._lastTiltX = tiltX;
                    this._lastTiltY = tiltY;
                    /**
                     * Emits when a tilt sensor is activated.
                     * @event LPF2Hub#tilt
                     * @param {string} port If the event is fired from the Move Hub or Control+ Hub's in-built tilt sensor, the special port "TILT" is used.
                     * @param {number} x
                     * @param {number} y
                     * @param {number} z (Only available when using a Control+ Hub)
                     */
                    this.emit("tilt", port.id, this._lastTiltX, this._lastTiltY, this._lastTiltZ);
                    break;
                }
                case Consts.DeviceType.BOOST_TACHO_MOTOR: {
                    const rotation = data.readInt32LE(4);
                    /**
                     * Emits when a rotation sensor is activated.
                     * @event LPF2Hub#rotate
                     * @param {string} port
                     * @param {number} rotation
                     */
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.DeviceType.BOOST_MOVE_HUB_MOTOR: {
                    const rotation = data.readInt32LE(4);
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.DeviceType.CONTROL_PLUS_LARGE_MOTOR: {
                    const rotation = data.readInt32LE(4);
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.DeviceType.CONTROL_PLUS_XLARGE_MOTOR: {
                    const rotation = data.readInt32LE(4);
                    this.emit("rotate", port.id, rotation);
                    break;
                }
                case Consts.DeviceType.CONTROL_PLUS_TILT: {
                    const tiltZ = data.readInt16LE(4);
                    const tiltY = data.readInt16LE(6);
                    const tiltX = data.readInt16LE(8);
                    this._lastTiltX = tiltX;
                    this._lastTiltY = tiltY;
                    this._lastTiltZ = tiltZ;
                    this.emit("tilt", "TILT", this._lastTiltX, this._lastTiltY, this._lastTiltZ);
                    break;
                }
                case Consts.DeviceType.CONTROL_PLUS_GYRO: {
                    const gyroX = Math.round(data.readInt16LE(4) * 7 / 400);
                    const gyroY = Math.round(data.readInt16LE(6) * 7 / 400);
                    const gyroZ = Math.round(data.readInt16LE(8) * 7 / 400);
                    /**
                     * Emits when gyroscope detects movement. Measured in DPS - degrees per second.
                     * @event LPF2Hub#gyro
                     * @param {string} port
                     * @param {number} x
                     * @param {number} y
                     * @param {number} z
                     */
                    this.emit("gyro", "GYRO", gyroX, gyroY, gyroZ);
                    break;
                }
                case Consts.DeviceType.CONTROL_PLUS_ACCELEROMETER: {
                    const accelX = Math.round(data.readInt16LE(4) / 4.096);
                    const accelY = Math.round(data.readInt16LE(6) / 4.096);
                    const accelZ = Math.round(data.readInt16LE(8) / 4.096);
                    /**
                     * Emits when accelerometer detects movement. Measured in mG.
                     * @event LPF2Hub#accel
                     * @param {string} port
                     * @param {number} x
                     * @param {number} y
                     * @param {number} z
                     */
                    this.emit("accel", "ACCEL", accelX, accelY, accelZ);
                    break;
                }
                case Consts.DeviceType.BOOST_TILT: {
                    const tiltX = data.readInt8(4);
                    const tiltY = data.readInt8(5);
                    this._lastTiltX = tiltX;
                    this._lastTiltY = tiltY;
                    this.emit("tilt", port.id, this._lastTiltX, this._lastTiltY, this._lastTiltZ);
                    break;
                }
                case Consts.DeviceType.POWERED_UP_REMOTE_BUTTON: {
                    switch (data[4]) {
                        case 0x01: {
                            this.emit("button", port.id, Consts.ButtonState.UP);
                            break;
                        }
                        case 0xff: {
                            this.emit("button", port.id, Consts.ButtonState.DOWN);
                            break;
                        }
                        case 0x7f: {
                            this.emit("button", port.id, Consts.ButtonState.STOP);
                            break;
                        }
                        case 0x00: {
                            this.emit("button", port.id, Consts.ButtonState.RELEASED);
                            break;
                        }
                    }
                    break;
                }
                case Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR: {
                    if (data[4] <= 10) {
                        this.emit("color", port.id, data[4]);
                    }
                    break;
                }
                case Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER: {
                    /**
                     * Emits on a speed change.
                     * @event LPF2Hub#speed
                     * @param {string} port
                     * @param {number} speed
                     */
                    const speed = data.readInt16LE(4);
                    this.emit("speed", port.id, speed);
                    break;
                }
            }
        }

    }


}
