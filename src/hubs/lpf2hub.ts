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


    public connect () {
        return new Promise(async (resolve, reject) => {
            await super.connect();
            await this._bleDevice.discoverCharacteristicsForService(Consts.BLEService.LPF2_HUB);
            this._bleDevice.subscribeToCharacteristic(Consts.BLECharacteristic.LPF2_ALL, this._parseMessage.bind(this));
            await this.sleep(100);
            this.send(Buffer.from([0x01, 0x02, 0x02]), Consts.BLECharacteristic.LPF2_ALL); // Activate button reports
            this.send(Buffer.from([0x01, 0x03, 0x05]), Consts.BLECharacteristic.LPF2_ALL); // Request firmware version
            this.send(Buffer.from([0x01, 0x04, 0x05]), Consts.BLECharacteristic.LPF2_ALL); // Request hardware version
            this.send(Buffer.from([0x01, 0x05, 0x02]), Consts.BLECharacteristic.LPF2_ALL); // Activate RSSI updates
            this.send(Buffer.from([0x01, 0x06, 0x02]), Consts.BLECharacteristic.LPF2_ALL); // Activate battery level reports
            this.send(Buffer.from([0x01, 0x0d, 0x05]), Consts.BLECharacteristic.LPF2_ALL); // Request primary MAC address
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
            this.send(Buffer.from([0x02, 0x01]), Consts.BLECharacteristic.LPF2_ALL, () => {
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
            this.send(data, Consts.BLECharacteristic.LPF2_ALL);
            this.send(data, Consts.BLECharacteristic.LPF2_ALL);
            this._name = name;
            return resolve();
        });
    }


    public send (message: Buffer, uuid: string, callback?: () => void) {
        message = Buffer.concat([Buffer.alloc(2), message]);
        message[0] = message.length;
        debug("Sent Message (LPF2_ALL)", message);
        this._bleDevice.writeToCharacteristic(uuid, message, callback);
    }


    public subscribe (portId: number, deviceType: number, mode: number) {
        this.send(Buffer.from([0x41, portId, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), Consts.BLECharacteristic.LPF2_ALL);
    }


    public unsubscribe (portId: number, mode: number) {
        this.send(Buffer.from([0x41, portId, mode, 0x01, 0x00, 0x00, 0x00, 0x00]), Consts.BLECharacteristic.LPF2_ALL);
    }


    // protected _combinePorts (port: string, type: number) {
    //     if (!this._ports[port]) {
    //         return;
    //     }
    //     const portObj = this._portLookup(port);
    //     if (portObj) {
    //         Object.keys(this._ports).forEach((id) => {
    //             if (this._ports[id].type === type && this._ports[id].value !== portObj.value && !this._virtualPorts[`${portObj.value < this._ports[id].value ? portObj.id : this._ports[id].id}${portObj.value > this._ports[id].value ? portObj.id : this._ports[id].id}`]) {
    //                 debug("Combining ports", portObj.value < this._ports[id].value ? portObj.id : id, portObj.value > this._ports[id].value ? portObj.id : id);
    //                 this.send(Buffer.from([0x61, 0x01, portObj.value < this._ports[id].value ? portObj.value : this._ports[id].value, portObj.value > this._ports[id].value ? portObj.value : this._ports[id].value]), Consts.BLECharacteristic.LPF2_ALL);
    //             }
    //         });
    //     }
    // }


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


    private _parseDeviceInfo (message: Buffer) {

        // Button press reports
        if (message[3] === 0x02) {
            if (message[5] === 1) {
                /**
                 * Emits when a button is pressed.
                 * @event LPF2Hub#button
                 * @param {string} button
                 * @param {ButtonState} state
                 */
                this.emit("button", "GREEN", Consts.ButtonState.PRESSED);
                return;
            } else if (message[5] === 0) {
                this.emit("button", "GREEN", Consts.ButtonState.RELEASED);
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
                this.emit("rssiChange", this._rssi);
            }

        // primary MAC Address
        } else if (message[3] === 0x0d) {
            this._primaryMACAddress = decodeMACAddress(message.slice(5));

        // Battery level reports
        } else if (message[3] === 0x06) {
            this._batteryLevel = message[5];
        }

    }

    private _parsePortMessage (message: Buffer) {

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
                this._sendPortInformationRequest(portId);
            }

            const device = this._createDevice(deviceType, portId);
            this._attachDevice(device);

        // Handle device detachments
        } else if (event === 0x00) {
            const device = this._getDeviceByPortId(portId);
            if (device) {
                this._detachDevice(device);
            }
        }

        // let port = this._getPortForPortNumber(data[3]);

        // if (!port) {
        //     if (data[4] === 0x02) {
        //         const portA = this._getPortForPortNumber(data[7]);
        //         const portB = this._getPortForPortNumber(data[8]);
        //         if (portA && portB) {
        //             this._virtualPorts[`${portA.id}${portB.id}`] = new Port(`${portA.id}${portB.id}`, data[3]);
        //             port = this._getPortForPortNumber(data[3]);
        //             if (port) {
        //                 port.connected = true;
        //                 this._registerDeviceAttachment(port, deviceType);
        //             } else {
        //                 return;
        //             }
        //         } else {
        //             return;
        //         }
        //     } else {
        //         return;
        //     }
        // }

    }


    private _sendPortInformationRequest (port: number) {
        this.send(Buffer.from([0x21, port, 0x01]), Consts.BLECharacteristic.LPF2_ALL);
        this.send(Buffer.from([0x21, port, 0x02]), Consts.BLECharacteristic.LPF2_ALL); // Mode combinations
    }


    private _parsePortInformationResponse (message: Buffer) {
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
            this._sendModeInformationRequest(port, i, 0x00); // Mode Name
            this._sendModeInformationRequest(port, i, 0x01); // RAW Range
            this._sendModeInformationRequest(port, i, 0x02); // PCT Range
            this._sendModeInformationRequest(port, i, 0x03); // SI Range
            this._sendModeInformationRequest(port, i, 0x04); // SI Symbol
            this._sendModeInformationRequest(port, i, 0x80); // Value Format
        }
    }


    private _sendModeInformationRequest (port: number, mode: number, type: number) {
        this.send(Buffer.from([0x22, port, mode, type]), Consts.BLECharacteristic.LPF2_ALL);
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

    //     if ((data[3] === 0x3d && this.type === Consts.HubType.CONTROL_PLUS_HUB)) { // Control+ CPU Temperature
    //         /**
    //          * Emits when a change is detected on a temperature sensor. Measured in degrees centigrade.
    //          * @event LPF2Hub#temp
    //          * @param {string} port For Control+ Hubs, port will be "CPU" as the sensor reports CPU temperature.
    //          * @param {number} temp
    //          */
    //         this.emit("temp", "CPU", ((data.readInt16LE(4) / 900) * 90).toFixed(2));
    //         return;
    //     }

    //     const port = this._getPortForPortNumber(data[3]);

    //     if (!port) {
    //         return;
    //     }

    //     if (port && port.connected) {
    //         switch (port.type) {
    //             case Consts.DeviceType.DUPLO_TRAIN_BASE_COLOR: {
    //                 if (data[4] <= 10) {
    //                     this.emit("color", port.id, data[4]);
    //                 }
    //                 break;
    //             }
    //             case Consts.DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER: {
    //                 /**
    //                  * Emits on a speed change.
    //                  * @event LPF2Hub#speed
    //                  * @param {string} port
    //                  * @param {number} speed
    //                  */
    //                 const speed = data.readInt16LE(4);
    //                 this.emit("speed", port.id, speed);
    //                 break;
    //             }
    //         }
    //     }

    }


}
