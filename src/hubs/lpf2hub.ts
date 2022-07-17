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
        await this._requestHubPropertyReports(Consts.HubPropertyPayload.BUTTON_STATE);
        await this._requestHubPropertyValue(Consts.HubPropertyPayload.FW_VERSION);
        await this._requestHubPropertyValue(Consts.HubPropertyPayload.HW_VERSION);
        await this._requestHubPropertyReports(Consts.HubPropertyPayload.RSSI);
        await this._requestHubPropertyReports(Consts.HubPropertyPayload.BATTERY_VOLTAGE);
        await this._requestHubPropertyValue(Consts.HubPropertyPayload.PRIMARY_MAC_ADDRESS);
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
        if (len <= this._messageBuffer.length) {

            const message = this._messageBuffer.slice(0, len);
            this._messageBuffer = this._messageBuffer.slice(len);

            debug("Received Message (LPF2_ALL)", message);

            switch (message[2]) {
                case Consts.MessageType.HUB_PROPERTIES: {
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
                case Consts.MessageType.HUB_ATTACHED_IO: {
                    this._parsePortMessage(message);
                    break;
                }
                case Consts.MessageType.PORT_INFORMATION: {
                    this._parsePortInformationResponse(message);
                    break;
                }
                case Consts.MessageType.PORT_MODE_INFORMATION: {
                    this._parseModeInformationResponse(message);
                    break;
                }
                case Consts.MessageType.PORT_VALUE_SINGLE: {
                    this._parseSensorMessage(message);
                    break;
                }
                case Consts.MessageType.PORT_OUTPUT_COMMAND_FEEDBACK: {
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
        return new Promise<void>((resolve) => {
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
        if (message[3] === Consts.HubPropertyPayload.BUTTON_STATE) {
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

        } else if (message[3] === Consts.HubPropertyPayload.FW_VERSION) {
            this._firmwareVersion = decodeVersion(message.readInt32LE(5));
            this._checkFirmware(this._firmwareVersion);

        } else if (message[3] === Consts.HubPropertyPayload.HW_VERSION) {
            this._hardwareVersion = decodeVersion(message.readInt32LE(5));

        } else if (message[3] === Consts.HubPropertyPayload.RSSI) {
            const rssi = message.readInt8(5);
            if (rssi !== 0) {
                this._rssi = rssi;
                this.emit("rssi", { rssi: this._rssi });
            }

        } else if (message[3] === Consts.HubPropertyPayload.PRIMARY_MAC_ADDRESS) {
            this._primaryMACAddress = decodeMACAddress(message.slice(5));

        } else if (message[3] === Consts.HubPropertyPayload.BATTERY_VOLTAGE) {
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

        if (event === Consts.Event.ATTACHED_IO) {

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

        } else if (event === Consts.Event.DETACHED_IO) {
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

        } else if (event === Consts.Event.ATTACHED_VIRTUAL_IO) {
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
            await this._sendModeInformationRequest(port, i, Consts.ModeInformationType.NAME);
            await this._sendModeInformationRequest(port, i, Consts.ModeInformationType.RAW);
            await this._sendModeInformationRequest(port, i, Consts.ModeInformationType.PCT);
            await this._sendModeInformationRequest(port, i, Consts.ModeInformationType.SI);
            await this._sendModeInformationRequest(port, i, Consts.ModeInformationType.SYMBOL);
            await this._sendModeInformationRequest(port, i, Consts.ModeInformationType.VALUE_FORMAT);
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
            case Consts.ModeInformationType.NAME:
                modeInfoDebug(`Port ${port}, mode ${mode}, name ${message.slice(6, message.length).toString()}`);
                break;
            case Consts.ModeInformationType.RAW:
                modeInfoDebug(`Port ${port}, mode ${mode}, RAW min ${message.readFloatLE(6)}, max ${message.readFloatLE(10)}`);
                break;
            case Consts.ModeInformationType.PCT:
                modeInfoDebug(`Port ${port}, mode ${mode}, PCT min ${message.readFloatLE(6)}, max ${message.readFloatLE(10)}`);
                break;
            case Consts.ModeInformationType.SI:
                modeInfoDebug(`Port ${port}, mode ${mode}, SI min ${message.readFloatLE(6)}, max ${message.readFloatLE(10)}`);
                break;
            case Consts.ModeInformationType.SYMBOL:
                modeInfoDebug(`Port ${port}, mode ${mode}, SI symbol ${message.slice(6, message.length).toString()}`);
                break;
            case Consts.ModeInformationType.VALUE_FORMAT:
                const numValues = message[6];
                const dataType = ["8bit", "16bit", "32bit", "float"][message[7]];
                const totalFigures = message[8];
                const decimals = message[9];
                modeInfoDebug(`Port ${port}, mode ${mode}, Value ${numValues} x ${dataType}, Decimal format ${totalFigures}.${decimals}`);
        }
    }


    private _parsePortAction (message: Buffer) {
        for (let offset = 3; offset < message.length; offset += 2) {
            const device = this._getDeviceByPortId(message[offset]);

            if (device) {
                device.finish(message[offset+1]);
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
