import { Peripheral } from "@abandonware/noble";

import { Hub } from "./hub";
import { IPortMode, Port } from "./port";

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
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x02, 0x02])); // Activate button reports
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x03, 0x05])); // Request firmware version
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x04, 0x05])); // Request hardware version
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x06, 0x02])); // Activate battery level reports
            this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x0d, 0x05])); // Request primary MAC address
            if (this._voltagePort !== undefined) {
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, this._voltagePort, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01])); // Activate voltage reports
            }
            if (this._currentPort !== undefined) {
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, this._currentPort, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01])); // Activate current reports
            }
            if (this.type === Consts.HubType.DUPLO_TRAIN_HUB) {
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x41, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x01]));
            }
            setTimeout(() => {
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x03, 0x05])); // Request firmware version again
                this._writeMessage(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x01, 0x04, 0x05])); // Request firmware version again
                this.emit("connect");
                resolve();
            }, 200);
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
        }
        this._sendPortInformationRequest(data[3]);

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
        const portHex = toHex(data[3]);
        const mode = data[4];
        const type = data[5];
        const port = this._getPortForPortNumber(data[3]) as Port;

        if (!port) {
            return false;
        }

        port.modes[mode] = port.modes[mode] || {};

        switch (type) {
            case 0x00: // Mode Name
                const name = data.slice(6, data.length).toString();
                port.modes[mode].name = name;
                modeInfoDebug(`Port ${portHex}, mode ${mode}, name ${name}`);
                break;
            case 0x01: // RAW Range
                modeInfoDebug(`Port ${portHex}, mode ${mode}, RAW min ${data.readFloatLE(6)}, max ${data.readFloatLE(10)}`);
                break;
            case 0x02: // PCT Range
                modeInfoDebug(`Port ${portHex}, mode ${mode}, PCT min ${data.readFloatLE(6)}, max ${data.readFloatLE(10)}`);
                break;
            case 0x03: // SI Range
                modeInfoDebug(`Port ${portHex}, mode ${mode}, SI min ${data.readFloatLE(6)}, max ${data.readFloatLE(10)}`);
                break;
            case 0x04: // SI Symbol
                const unit = data.slice(6, data.length).toString();
                port.modes[mode].unit = unit;
                modeInfoDebug(`Port ${portHex}, mode ${mode}, SI symbol ${unit}`);
                break;
            case 0x80: // Value Format
                const numValues = data[6];
                const dataType = [Consts.ValueType.Int8, Consts.ValueType.Int16, Consts.ValueType.Int32, Consts.ValueType.Float][data[7]];
                const totalFigures = data[8];
                const decimals = data[9];

                port.modes[mode].valueType = dataType;
                modeInfoDebug(`Port ${portHex}, mode ${mode}, Value ${numValues} x ${dataType}, Decimal format ${totalFigures}.${decimals}`);
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

        if (port && port.connected && port.mode && port.modes[port.mode]) {
            const mode = port.modes[port.mode];
            const values = [];

            for (let index = 4; index < data.length; index += Consts.VALUE_SIZE[mode.valueType]) {
                switch (mode.valueType) {
                    case Consts.ValueType.Int8:
                        values.push(data.readInt8(index));
                        break;
                    case Consts.ValueType.Int16:
                        values.push(data.readInt16LE(index));
                        break;
                    case Consts.ValueType.Int32:
                        values.push(data.readInt32LE(index));
                        break;
                    case Consts.ValueType.Float:
                        values.push(data.readFloatLE(index));
                        break;
                }
            }
            this.emit("sensor", port.id, mode, values);

            this._emitSensorEvent(port, mode, values);
        }

    }

    private _emitSensorEvent(port: Port, mode: IPortMode, values: number[]) {
        switch (mode.name) {
            case "COLOR": {
                this.emit("color", port.id, values[0]);
                break;
            }
            case "PROX":
            case "LPF2-DETECT": {
                this.emit("distance", port.id, values[0]);
                break;
            }
            case "COUNT":
            case "LPF2-COUNT": {
                this.emit("count", port.id, values[0]);
                break;
            }
            case "REFLT": {
                this.emit("reflect", port.id, values[0]);
                break;
            }
            case "AMBI": {
                this.emit("luminosity", port.id, values[0]);
                break;
            }
            case "RGB_I": {
                this.emit("luminosity", port.id, values[0], values[1], values[2]);
                break;
            }
            case "SPEC_1": {
                this.emit("color", port.id, values[0]);
                this.emit("distance", port.id, values[1]);
                this.emit("reflect", port.id, values[3]);
                this.emit("colorAndDistance", port.id, values[3], values[1]);
                break;
            }
            case "POWER": {
                this.emit("power", port.id, values[0]);
                break;
            }
            case "SPEED": {
                this.emit("speed", port.id, values[0]);
                break;
            }
            case "POS": {
                if (port.type === Consts.DeviceType.CONTROL_PLUS_TILT) {
                    this.emit("angle", port.id, values[0], values[1], values[2]);
                } else {
                    this.emit("rotate", port.id, values[0]);
                }
                break;
            }
            case "APOS": {
                this.emit("absolutePosition", port.id, values[0]);
                break;
            }
            case "LOAD": {
                this.emit("load", port.id, values[0]);
                break;
            }
            case "ANGLE":
            case "LPF2-ANGLE": {
                this.emit("angle", port.id, values[0], values[1], values[2] || 0);
                break;
            }
            case "TILT":
            case "LPF2-TILT": {
                this.emit("tilt", port.id, values[0]);
                break;
            }
            case "ORINT": {
                this.emit("orientation", port.id, values[0]);
                break;
            }
            case "IMPCT":
            case "LPF2-CRASH":
            case "IMP": {
                this.emit("impact", port.id, values[0]);
                break;
            }
            case "ACCEL":
            case "ROT": {
                this.emit("angle", port.id, values[0], values[1], values[2]);
                break;
            }
        }
    }
}
