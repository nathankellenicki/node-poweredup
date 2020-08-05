import { EventEmitter } from "events";

import { IDeviceInterface, IMode, IEventData } from "../interfaces";

import * as Consts from "../consts";

import { normalize, toHex, toBin } from "../utils";

import Debug = require("debug");
const debug = Debug("device");
const modeInfoDebug = Debug("lpf2hubmodeinfo");
/**
 * @class Device
 * @extends EventEmitter
 */
export class Device extends EventEmitter {

    public autoSubscribe: boolean = true;
    public values: {[event: string]: any} = {};

    protected _modeCount: number = 0;
    protected _modes: IMode[] = [];
    protected _mode: number | undefined;
    protected _modeMap: {[event: string]: number} = {};
    protected _busy: boolean = false;
    protected _finished: (() => void) | undefined;

    protected _eventHandlers: {[event: string]: (data: IEventData) => void} = {};

    private _ready: boolean = false;
    private _hub: IDeviceInterface;
    private _portId: number;
    private _connected: boolean = true;
    private _type: Consts.DeviceType;

    private _isWeDo2SmartHub: boolean;
    private _isVirtualPort: boolean = false;
    private _eventTimer: NodeJS.Timer | null = null;

    constructor (hub: IDeviceInterface, portId: number, modes:  IMode[] = [], type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super();
        this._hub = hub;
        this._portId = portId;
        this._type = type;
        this._modes = modes;
        this._isWeDo2SmartHub = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);
        this._isVirtualPort = this.hub.isPortVirtual(portId);

        if (!this.autoParse) {
            this._init();
        }
    }

    private _init() {
        if (this._ready) {
            return;
        }
        this._modeMap = this._modes.reduce((map: {[name: string]: number}, mode, index) => {
            map[mode.name] = index;
            return map;
        }, {});

        const eventAttachListener = (event: string) => {
            if (event === "detach") {
                return;
            }
            if (this.autoSubscribe) {
                if (this._modeMap[event] !== undefined) {
                    this.subscribe(this._modeMap[event]);
                }
            }
        };

        const deviceDetachListener = (device: Device) => {
            if (device.portId === this.portId) {
                this._connected = false;
                this.hub.removeListener("detach", deviceDetachListener);
                this.emit("detach");
            }
        };

        for (const event in this._modeMap) {
            if (this.hub.listenerCount(event) > 0) {
                eventAttachListener(event);
            }
        }

        this.hub.on("newListener", eventAttachListener);
        this.on("newListener", eventAttachListener);
        this.hub.on("detach", deviceDetachListener);

        this._ready = true;
        this.emit('ready');
    }

    /**
     * @readonly
     * @property {boolean} connected Check if the device is still attached.
     */
    public get connected () {
        return this._connected;
    }

    /**
     * @readonly
     * @property {Hub} hub The Hub the device is attached to.
     */
    public get hub () {
        return this._hub;
    }

    public get portId () {
        return this._portId;
    }

    /**
     * @readonly
     * @property {string} portName The port the device is attached to.
     */
    public get portName () {
        return this.hub.getPortNameForPortId(this.portId);
    }

    /**
     * @readonly
     * @property {number} type The type of the device
     */
    public get type () {
        return this._type;
    }

    public get typeName () {
        return Consts.DeviceTypeNames[this.type];
    }

    /**
     * @readonly
     * @property {number} mode The mode the device is currently in
     */
    public get mode () {
        return this._mode;
    }

    protected get isWeDo2SmartHub () {
        return this._isWeDo2SmartHub;
    }

    /**
     * @readonly
     * @property {boolean} isVirtualPort Is this device attached to a virtual port (ie. a combined device)
     */
    protected get isVirtualPort () {
        return this._isVirtualPort;
    }

    /**
     * @readonly
     * @property {string[]} inputs List of availlable input modes.
     */
    public get inputs () {
        return this._modes.filter(mode => mode.input).map(({ name }) => name);
    }

    /**
     * @readonly
     * @property {string[]} outputs List of availlable output modes).
     */
    public get outputs () {
        return this._modes.filter(mode => mode.output).map(({ name }) => name);
    }

    /**
     * @readonly
     * @property {boolean} ready ready state.
     */
    public get isReady () {
        return this._ready;
    }

    public writeDirect (mode: number, data: Buffer) {
        if (this.isWeDo2SmartHub) {
            return this.send(Buffer.concat([Buffer.from([this.portId, 0x01, 0x02]), data]), Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
        } else {
            return this.send(Buffer.concat([Buffer.from([0x81, this.portId, 0x11, 0x51, mode]), data]), Consts.BLECharacteristic.LPF2_ALL);
        }
    }

    public autoParseWriteDirect (mode: string, ...data: number[]) {
        if (!this.autoParse) return;
        const modeId = this._modeMap[mode];
        if (modeId === undefined) return;

        const { values } = this._modes[modeId];
        const valueSize = Consts.ValueTypeSize[values.type];

        const buf = Buffer.alloc(values.count * valueSize);
        for(let v = 0; v < values.count; v++) {
            const offset =  v * valueSize;
            switch(values.type) {
                case Consts.ValueType.Int8:
                    buf.writeInt8(data[v] || 0, offset);
                    break;
                case Consts.ValueType.Int16:
                    buf.writeInt16LE(data[v] || 0, offset);
                    break;
                case Consts.ValueType.Int32:
                    buf.writeInt32LE(data[v] || 0, offset);
                    break;
                case Consts.ValueType.Float:
                    buf.writeFloatLE(data[v] || 0, offset);
                    break;
            }
        }

        return this.writeDirect(modeId, buf);
    }

    public send (data: Buffer, characteristic: string = Consts.BLECharacteristic.LPF2_ALL) {
        this._ensureConnected();
        return this.hub.send(data, characteristic);
    }

    public subscribe (mode: number) {
        this._ensureConnected();
        if (mode !== this._mode) {
            this._mode = mode;
            this.hub.subscribe(this.portId, this.type, mode);
        }
    }

    public unsubscribe (mode: number) {
        this._ensureConnected();
    }

    public receive (message: Buffer) {
        this.notify("receive", { message });

        switch (message[2]) {
            case 0x43: {
                this._parseInformationResponse(message);
                break;
            }
            case 0x44: {
                this._parseModeInformationResponse(message);
                break;
            }
            case 0x45: {
                this.parseSensorMessage(message);
                break;
            }
            case 0x82: {
                this._parsePortAction(message);
                break;
            }
        }
    }

    private async _parseInformationResponse (message: Buffer) {
        if (message[4] === 2) {
            const modeCombinationMasks: number[] = [];
            for (let i = 5; i < message.length; i += 2) {
                modeCombinationMasks.push(message.readUInt16LE(i));
            }
            modeInfoDebug(`Port ${toHex(this.portId)}, mode combinations [${modeCombinationMasks.map((c) => toBin(c, 0)).join(", ")}]`);
            return;
        }
        this._modeCount = message[6];
        const input = toBin(message.readUInt16LE(7), this._modeCount);
        const output = toBin(message.readUInt16LE(9), this._modeCount);
        modeInfoDebug(`Port ${toHex(this.portId)}, total modes ${this._modeCount}, input modes ${input}, output modes ${output}`);

        if (this.autoParse) {
            this._modes = new Array(+this._modeCount);
        }

        for (let i = 0; i < this._modeCount; i++) {
            if (this.autoParse) {
                this._modes[i] = {
                    name: '',
                    input: input[this._modeCount - i - 1] === '1',
                    output: output[this._modeCount - i - 1] === '1',
                    raw: { min: 0, max: 255 },
                    pct: { min: 0, max: 100 },
                    si: { min: 0, max: 255, symbol: '' },
                    values: { count: 1, type: Consts.ValueType.Int8 },
                };
            }
            await this._sendModeInformationRequest(i, 0x00); // Mode Name
            await this._sendModeInformationRequest(i, 0x01); // RAW Range
            await this._sendModeInformationRequest(i, 0x02); // PCT Range
            await this._sendModeInformationRequest(i, 0x03); // SI Range
            await this._sendModeInformationRequest(i, 0x04); // SI Symbol
            await this._sendModeInformationRequest(i, 0x80); // Value Format
        }
    }

    private _sendModeInformationRequest (mode: number, type: number) {
        return this.send(Buffer.from([0x22, this.portId, mode, type]), Consts.BLECharacteristic.LPF2_ALL);
    }

    private _parseModeInformationResponse (message: Buffer) {
        const mode = message[4];
        const debugHeader = `Port ${toHex(this.portId)}, mode ${mode},`;
        const type = message[5];
        switch (type) {
            case 0x00: { // Mode Name
                const name = message.slice(6, message.length).toString().replace(/\0/g, '');
                modeInfoDebug(`${debugHeader} name ${name}`);
                if (this.autoParse) {
                    this._modes[mode].name=name;
                }
                break;
            }
            case 0x01: { // RAW Range
                const min = message.readFloatLE(6);
                const max = message.readFloatLE(10);
                modeInfoDebug(`${debugHeader} RAW min ${min}, max ${max}`);
                if (this.autoParse) {
                    this._modes[mode].raw.min=min
                    this._modes[mode].raw.max=max;
                }
                break;
            }
            case 0x02: { // PCT Range
                const min = message.readFloatLE(6);
                const max = message.readFloatLE(10);
                modeInfoDebug(`${debugHeader} PCT min ${min}, max ${max}`);
                if (this.autoParse) {
                    this._modes[mode].pct.min=min;
                    this._modes[mode].pct.max=max;
                }
                break;
            }
            case 0x03: {// SI Range
                const min = message.readFloatLE(6);
                const max = message.readFloatLE(10);
                modeInfoDebug(`${debugHeader} SI min ${min}, max ${max}`);
                if (this.autoParse) {
                    this._modes[mode].si.min=min;
                    this._modes[mode].si.max=max;
                }
                break;
            }
            case 0x04: {// SI Symbol
                const symbol = message.slice(6, message.length).toString().replace(/\0/g, '');
                modeInfoDebug(`${debugHeader} SI symbol ${symbol}`);
                if (this.autoParse) {
                    this._modes[mode].si.symbol=symbol;
                }
                break;
            }
            case 0x80: {// Value Format
                const numValues = message[6];
                const dataType = message[7];
                const totalFigures = message[8];
                const decimals = message[9];
                modeInfoDebug(`${debugHeader} Value ${numValues} x ${dataType}, Decimal format ${totalFigures}.${decimals}`);
                if (this.autoParse) {
                this._modes[mode].values.count=numValues;
                this._modes[mode].values.type=dataType;

                    if (mode === this._modeCount - 1) {
                        this._init();
                    }
                }
            }
        }
    }

    public parseSensorMessage(message: Buffer) {
        const mode = this._mode;
        if (mode === undefined) {
            return;
        }

        const { name, raw, pct, si, values, weDo2SmartHub } = this._modes[mode];
        if (this._isWeDo2SmartHub && !weDo2SmartHub) {
            return;
        }
        const valueSize = Consts.ValueTypeSize[values.type];
        const data = [];
        const byteStart = this._isWeDo2SmartHub ? 2 : 4;

        for(let v = 0; v < values.count; v++) {
            const offset = byteStart + v * valueSize;
            switch(values.type) {
                case Consts.ValueType.Int8:
                    data.push(message.readInt8(offset));
                    break;
                case Consts.ValueType.Int16:
                    data.push(message.readInt16LE(offset));
                    break;
                case Consts.ValueType.Int32:
                    data.push(message.readInt32LE(offset));
                    break;
                case Consts.ValueType.Float:
                    data.push(message.readFloatLE(offset));
                    break;
            }
        }

        const eventData = {
            raw: data,
            pct: data.map(value => normalize(value, {raw, out: pct})),
            si: data.map(value => normalize(value, {raw, out: si}))
        }

        if (this._eventHandlers[name]) {
            this._eventHandlers[name](eventData);
        } else {
            this.notify(name, eventData);
        }
    }

    private _parsePortAction (message: Buffer) {
        if (message[4] === 0x0a) {
            this.finish();
        }
    }

    public notify (event: string, values: any) {
        this.values[event] = values;
        this.emit(event, values);
        if (this.hub.listenerCount(event) > 0) {
            this.hub.emit(event, this, values);
        }
    }

    public requestUpdate () {
        this.send(Buffer.from([0x21, this.portId, 0x00]));
    }

    public finish () {
        this._busy = false;
        if (this._finished) {
            this._finished();
            this._finished = undefined;
        }
    }

    public setEventTimer (timer: NodeJS.Timer) {
        this._eventTimer = timer;
    }

    public cancelEventTimer () {
        if (this._eventTimer) {
            clearTimeout(this._eventTimer);
            this._eventTimer = null;
        }
    }

    private _ensureConnected () {
        if (!this.connected) {
            throw new Error("Device is not connected");
        }
    }

    private get autoParse() {
        return this.hub.autoParse || this._type ===  Consts.DeviceType.UNKNOWN;
    }
}
