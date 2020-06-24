import { EventEmitter } from "events";

import { IDeviceInterface, IMode } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class Device
 * @extends EventEmitter
 */
export class Device extends EventEmitter {

    public autoSubscribe: boolean = true;
    public values: {[event: string]: any} = {};

    protected _modes: IMode[] = [];
    protected _mode: number | undefined;
    protected _busy: boolean = false;
    protected _finished: (() => void) | undefined;

    private _ready: boolean = false;
    private _hub: IDeviceInterface;
    private _portId: number;
    private _connected: boolean = true;
    private _type: Consts.DeviceType;
    private _modeMap: {[event: string]: number} = {};

    private _isWeDo2SmartHub: boolean;
    private _isVirtualPort: boolean = false;
    private _eventTimer: NodeJS.Timer | null = null;

    constructor (hub: IDeviceInterface, portId: number, modeMap: {[event: string]: number} = {}, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super();
        this._hub = hub;
        this._portId = portId;
        this._type = type;
        this._modeMap = modeMap;
        this._isWeDo2SmartHub = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);
        this._isVirtualPort = this.hub.isPortVirtual(portId);

        const eventAttachListener = (event: string) => {
            if (event === "detach" || !this._ready) {
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

        if (!this.hub.autoParse) {
            this._ready = true;
            this.emit('ready');
        }
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
     * @property {string[]} events List of availlable events (input modes).
     */
    public get events () {
        return this._modes.filter(mode => mode.input).map(({ name }) => name);
    }

    /**
     * @readonly
     * @property {string[]} writeModes List of availlable write (output modes).
     */
    public get writeModes () {
        return this._modes.filter(mode => mode.output).map(({ name }) => name);
    }

    public writeDirect (mode: number, data: Buffer) {
        if (this.isWeDo2SmartHub) {
            return this.send(Buffer.concat([Buffer.from([this.portId, 0x01, 0x02]), data]), Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
        } else {
            return this.send(Buffer.concat([Buffer.from([0x81, this.portId, 0x11, 0x51, mode]), data]), Consts.BLECharacteristic.LPF2_ALL);
        }
    }

    public autoparseWriteDirect (mode: string, ...data: number[]) {
        if (!this.hub.autoParse) return;
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

        const mode = this._mode;
        if (mode === undefined) {
            return;
        }
        const { name, values } = this._modes[mode];
        const valueSize = Consts.ValueTypeSize[values.type];
        const data = [];

        for(let v = 0; v < values.count; v++) {
            const offset = 4 + v * valueSize;
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
        this.notify(name, data);
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

    public setModes(modes: IMode[]) {
        this._modes = modes;

        this._modeMap = modes.reduce((map: {[name: string]: number}, mode, index) => {
            map[mode.name] = index;
            return map;
        }, {});

        this._ready = true;
        this.emit('ready');
    }
}
