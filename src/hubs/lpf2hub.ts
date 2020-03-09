import { BaseHub } from "./basehub";

import * as Consts from "../consts";

import { decodeMACAddress, decodeVersion, toBin, toHex } from "../utils";

import Debug = require("debug");
const debug = Debug("lpf2hub");
const modeInfoDebug = Debug("lpf2hubmodeinfo");


/**
 * @class LPF2Hub
 * @extends BaseHub
 */
export class LPF2Hub extends BaseHub {

    private _messageBuffer: Buffer = Buffer.alloc(0);

    private _propertyRequestCallbacks: {[property: number]: ((data: Buffer) => void)} = {};


    public async connect () {
        debug("LPF2Hub connecting");
        await super.connect();
        await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.LPF2_HUB);
        this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.LPF2_ALL, this._parseMessage.bind(this));
        await this._requestHubPropertyReports(0x02); // Activate button reports
        await this._requestHubPropertyValue(0x03); // Request firmware version
        await this._requestHubPropertyValue(0x04); // Request hardware version
        await this._requestHubPropertyReports(0x05); // Activate RSSI updates
        await this._requestHubPropertyReports(0x06); // Activate battery level reports
        await this._requestHubPropertyValue(0x0d); // Request primary MAC address
        this.emit("connect");
        debug("LPF2Hub connected");
    }


    /**
     * Shutdown the Hub.
     * @method LPF2Hub#shutdown
     * @returns {Promise} Resolved upon successful disconnect.
     */
    public shutdown () {
        return this.send(Buffer.from([0x02, 0x01]), Consts.BLECharacteristic.LPF2_ALL);
    }


    /**
     * Set the name of the Hub.
     * @method LPF2Hub#setName
     * @param {string} name New name of the hub (14 characters or less, ASCII only).
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public async setName (name: string) {
        if (name.length > 14) {
            throw new Error("Name must be 14 characters or less");
        }
        let data = Buffer.from([0x01, 0x01, 0x01]);
        data = Buffer.concat([data, Buffer.from(name, "ascii")]);
        // Send this twice, as sometimes the first time doesn't take
        await this.send(data, Consts.BLECharacteristic.LPF2_ALL);
        await this.send(data, Consts.BLECharacteristic.LPF2_ALL);
        this._name = name;
    }


    public send (message: Buffer, uuid: string) {
        message = Buffer.concat([Buffer.alloc(2), message]);
        message[0] = message.length;
        debug("Sent Message (LPF2_ALL)", message);
        return this._bleDevice.writeToCharacteristic(uuid, message);
    }


    public subscribe (portId: number, deviceType: number, mode: number) {
        return this.send(Buffer.from([0x41, portId, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), Consts.BLECharacteristic.LPF2_ALL);
    }


    public unsubscribe (portId: number, mode: number) {
        return this.send(Buffer.from([0x41, portId, mode, 0x01, 0x00, 0x00, 0x00, 0x00]), Consts.BLECharacteristic.LPF2_ALL);
    }


    /**
     * Combines two ports with into a single virtual port.
     *
     * Note: The devices attached to the ports must be of the same device type.
     * @method LPF2Hub#createVirtualPort
     * @param {string} firstPortName First port name
     * @param {string} secondPortName Second port name
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public createVirtualPort (firstPortName: string, secondPortName: string) {
        const firstDevice = this.getDeviceAtPort(firstPortName);
        if (!firstDevice) {
            throw new Error(`Port ${firstPortName} does not have an attached device`);
        }
        const secondDevice = this.getDeviceAtPort(secondPortName);
        if (!secondDevice) {
            throw new Error(`Port ${secondPortName} does not have an attached device`);
        }
        if (firstDevice.type !== secondDevice.type) {
            throw new Error(`Both devices must be of the same type to create a virtual port`);
        }
        return this.send(Buffer.from([0x61, 0x01, firstDevice.portId, secondDevice.portId]), Consts.BLECharacteristic.LPF2_ALL);
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
                    const property = message[3];
                    const callback = this._propertyRequestCallbacks[property];
                    if (callback) {
                        callback(message);
                    } else {
                        this._parseHubPropertyResponse(message);
                    }
                    delete this._propertyRequestCallbacks[property];
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


    private _requestHubPropertyValue (property: number) {
        return new Promise((resolve) => {
            this._propertyRequestCallbacks[property] = (message) => {
                this._parseHubPropertyResponse(message);
                return resolve();
            };
            this.send(Buffer.from([0x01, property, 0x05]), Consts.BLECharacteristic.LPF2_ALL);
        });
    }


    private _requestHubPropertyReports (property: number) {
        return this.send(Buffer.from([0x01, property, 0x02]), Consts.BLECharacteristic.LPF2_ALL);
    }


    private _parseHubPropertyResponse (message: Buffer) {

        // Button press reports
        if (message[3] === 0x02) {
            if (message[5] === 1) {
                /**
                 * Emits when a button is pressed.
                 * @event LPF2Hub#button
                 * @param {string} button
                 * @param {ButtonState} state
                 */
                this.emit("button", { event: Consts.ButtonState.PRESSED });
                return;
            } else if (message[5] === 0) {
                this.emit("button", { event: Consts.ButtonState.RELEASED });
                return;
            }

        // Firmware version
        } else if (message[3] === 0x03) {
            this._firmwareVersion = decodeVersion(message.readInt32LE(5));
            this._checkFirmware(this._firmwareVersion);

        // Hardware version
        } else if (message[3] === 0x04) {
            this._hardwareVersion = decodeVersion(message.readInt32LE(5));

        // RSSI update
        } else if (message[3] === 0x05) {
            const rssi = message.readInt8(5);
            if (rssi !== 0) {
                this._rssi = rssi;
                this.emit("rssi", { rssi: this._rssi });
            }

        // primary MAC Address
        } else if (message[3] === 0x0d) {
            this._primaryMACAddress = decodeMACAddress(message.slice(5));

        // Battery level reports
        } else if (message[3] === 0x06) {
            const batteryLevel = message[5];
            if (batteryLevel !== this._batteryLevel) {
                this._batteryLevel = batteryLevel;
                this.emit("batteryLevel", { batteryLevel });
            }
        }

    }

    private async _parsePortMessage (message: Buffer) {

        const portId = message[3];
        const event = message[4];
        const deviceType = event ? message.readUInt16LE(5) : 0;

        // Handle device attachments
        if (event === 0x01) {

            if (modeInfoDebug.enabled) {
                const deviceTypeName = Consts.DeviceTypeNames[message[5]] || "Unknown";
                modeInfoDebug(`Port ${toHex(portId)}, type ${toHex(deviceType, 4)} (${deviceTypeName})`);
                const hwVersion = decodeVersion(message.readInt32LE(7));
                const swVersion = decodeVersion(message.readInt32LE(11));
                modeInfoDebug(`Port ${toHex(portId)}, hardware version ${hwVersion}, software version ${swVersion}`);
                await this._sendPortInformationRequest(portId);
            }

            const device = this._createDevice(deviceType, portId);
            this._attachDevice(device);

        // Handle device detachments
        } else if (event === 0x00) {
            const device = this._getDeviceByPortId(portId);
            if (device) {
                this._detachDevice(device);
                if (this.isPortVirtual(portId)) {
                    const portName = this.getPortNameForPortId(portId);
                    if (portName) {
                        delete this._portMap[portName];
                    }
                    this._virtualPorts = this._virtualPorts.filter((virtualPortId) => virtualPortId !== portId);
                }
            }

        // Handle virtual port creation
        } else if (event === 0x02) {
            const firstPortName = this.getPortNameForPortId(message[7]);
            const secondPortName = this.getPortNameForPortId(message[8]);
            // @ts-ignore NK These should never be undefined
            const virtualPortName = firstPortName + secondPortName;
            const virtualPortId = message[3];
            this._portMap[virtualPortName] = virtualPortId;
            this._virtualPorts.push(virtualPortId);
            const device = this._createDevice(deviceType, virtualPortId);
            this._attachDevice(device);
        }

    }


    private async _sendPortInformationRequest (port: number) {
        await this.send(Buffer.from([0x21, port, 0x01]), Consts.BLECharacteristic.LPF2_ALL);
        await this.send(Buffer.from([0x21, port, 0x02]), Consts.BLECharacteristic.LPF2_ALL); // Mode combinations
    }


    private async _parsePortInformationResponse (message: Buffer) {
        const port = message[3];
        if (message[4] === 2) {
            const modeCombinationMasks: number[] = [];
            for (let i = 5; i < message.length; i += 2) {
                modeCombinationMasks.push(message.readUInt16LE(i));
            }
            modeInfoDebug(`Port ${toHex(port)}, mode combinations [${modeCombinationMasks.map((c) => toBin(c, 0)).join(", ")}]`);
            return;
        }
        const count = message[6];
        const input = toBin(message.readUInt16LE(7), count);
        const output = toBin(message.readUInt16LE(9), count);
        modeInfoDebug(`Port ${toHex(port)}, total modes ${count}, input modes ${input}, output modes ${output}`);

        for (let i = 0; i < count; i++) {
            await this._sendModeInformationRequest(port, i, 0x00); // Mode Name
            await this._sendModeInformationRequest(port, i, 0x01); // RAW Range
            await this._sendModeInformationRequest(port, i, 0x02); // PCT Range
            await this._sendModeInformationRequest(port, i, 0x03); // SI Range
            await this._sendModeInformationRequest(port, i, 0x04); // SI Symbol
            await this._sendModeInformationRequest(port, i, 0x80); // Value Format
        }
    }


    private _sendModeInformationRequest (port: number, mode: number, type: number) {
        return this.send(Buffer.from([0x22, port, mode, type]), Consts.BLECharacteristic.LPF2_ALL);
    }


    private _parseModeInformationResponse (message: Buffer) {
        const port = toHex(message[3]);
        const mode = message[4];
        const type = message[5];
        switch (type) {
            case 0x00: // Mode Name
                modeInfoDebug(`Port ${port}, mode ${mode}, name ${message.slice(6, message.length).toString()}`);
                break;
            case 0x01: // RAW Range
                modeInfoDebug(`Port ${port}, mode ${mode}, RAW min ${message.readFloatLE(6)}, max ${message.readFloatLE(10)}`);
                break;
            case 0x02: // PCT Range
                modeInfoDebug(`Port ${port}, mode ${mode}, PCT min ${message.readFloatLE(6)}, max ${message.readFloatLE(10)}`);
                break;
            case 0x03: // SI Range
                modeInfoDebug(`Port ${port}, mode ${mode}, SI min ${message.readFloatLE(6)}, max ${message.readFloatLE(10)}`);
                break;
            case 0x04: // SI Symbol
                modeInfoDebug(`Port ${port}, mode ${mode}, SI symbol ${message.slice(6, message.length).toString()}`);
                break;
            case 0x80: // Value Format
                const numValues = message[6];
                const dataType = ["8bit", "16bit", "32bit", "float"][message[7]];
                const totalFigures = message[8];
                const decimals = message[9];
                modeInfoDebug(`Port ${port}, mode ${mode}, Value ${numValues} x ${dataType}, Decimal format ${totalFigures}.${decimals}`);
        }
    }


    private _parsePortAction (message: Buffer) {

        const portId = message[3];
        const device = this._getDeviceByPortId(portId);

        if (device) {
            const finished = (message[4] === 0x0a);
            if (finished) {
                device.finish();
            }
        }

    }


    private _parseSensorMessage (message: Buffer) {

        const portId = message[3];
        const device = this._getDeviceByPortId(portId);

        if (device) {
            device.receive(message);
        }

    }


}
