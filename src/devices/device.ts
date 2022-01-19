import { EventEmitter } from "events";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class Device
 * @extends EventEmitter
 */
export class Device extends EventEmitter {

    public autoSubscribe: boolean = true;
    public values: {[event: string]: any} = {};

    protected _mode: number | undefined;
    protected _busy: boolean = false;
    protected _finishedCallbacks: (() => void)[] = [];

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

    public writeDirect (mode: number, data: Buffer) {
        if (this.isWeDo2SmartHub) {
            return this.send(Buffer.concat([Buffer.from([this.portId, 0x01, 0x02]), data]), Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
        } else {
            return this.send(Buffer.concat([Buffer.from([0x81, this.portId, 0x11, 0x51, mode]), data]), Consts.BLECharacteristic.LPF2_ALL);
        }
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

    public finish (message: number) {
        if((message & 0x10) === 0x10) return; // "busy/full"
        this._busy = (message & 0x01) === 0x01;
        while(this._finishedCallbacks.length > Number(this._busy)) {
            const callback = this._finishedCallbacks.shift();
            if(callback) {
                 callback();
            }
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

}
