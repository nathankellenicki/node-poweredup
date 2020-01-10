import { EventEmitter } from "events";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class Device extends EventEmitter {

    public autoSubscribe: boolean = true;

    protected _mode: number | undefined;
    protected _busy: boolean = false;
    protected _finished: (() => void) | undefined;

    private _hub: IDeviceInterface;
    private _portId: number;
    private _connected: boolean = true;
    private _type: Consts.DeviceType;
    private _modeMap: {[event: string]: number} = {};

    private _isWeDo2SmartHub: boolean;
    private _isVirtualPort: boolean = false;

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
                    console.log(this._modeMap[event]);
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

    public get connected () {
        return this._connected;
    }

    public get hub () {
        return this._hub;
    }

    public get portId () {
        return this._portId;
    }

    public get portName () {
        return this.hub.getPortNameForPortId(this.portId);
    }

    public get type () {
        return this._type;
    }

    public get mode () {
        return this._mode;
    }

    protected get isWeDo2SmartHub () {
        return this._isWeDo2SmartHub;
    }

    protected get isVirtualPort () {
        return this._isVirtualPort;
    }

    public writeDirect (mode: number, data: Buffer, callback?: () => void) {
        if (this.isWeDo2SmartHub) {
            this.send(Buffer.concat([Buffer.from([this.portId, 0x01, 0x02]), data]), Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
        } else {
            this.send(Buffer.concat([Buffer.from([0x81, this.portId, 0x11, 0x51, mode]), data]), Consts.BLECharacteristic.LPF2_ALL, callback);
        }
    }

    public send (data: Buffer, characteristic: string = Consts.BLECharacteristic.LPF2_ALL, callback?: () => void) {
        this._ensureConnected();
        this.hub.send(data, characteristic, callback);
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
        this.emitGlobal("receive", { message });
    }

    public emitGlobal (event: string, ...args: any[]) {
        this.emit(event, ...args);
        if (this.hub.listenerCount(event) > 0) {
            this.hub.emit(event, this, ...args);
        }
    }

    public finish () {
        this._busy = false;
        if (this._finished) {
            this._finished();
            this._finished = undefined;
        }
    }

    private _ensureConnected () {
        if (!this.connected) {
            throw new Error("Device is not connected");
        }
    }

}
