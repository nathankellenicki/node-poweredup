import { EventEmitter } from "events";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class Device
 * @extends EventEmitter
 */
export class Device extends EventEmitter {

    public autoSubscribe: boolean = true;
    public values: {[event: string]: any} = {};

    protected _mode: number | undefined;
    protected _combinedModes: number[] = [];
    protected _busy: boolean = false;
    protected _finished: (() => void) | undefined;

    protected _supportsCombined: boolean = false;

    private _hub: IHubInterface;
    private _portId: number;
    private _connected: boolean = true;
    private _type: Consts.DeviceType;
    private _modeMap: {[event: string]: number} = {};
    private _dataSets: {[mode: number]: number} = {};

    private _isWeDo2SmartHub: boolean;
    private _isVirtualPort: boolean = false;
    private _eventTimer: NodeJS.Timer | null = null;

    constructor (
        hub: IHubInterface,
        portId: number,
        modeMap: {[event: string]: number} = {},
        dataSets: {[mode: number]: number} = {},
        type: Consts.DeviceType = Consts.DeviceType.UNKNOWN
    ) {
        super();
        this._hub = hub;
        this._portId = portId;
        this._type = type;
        this._modeMap = modeMap;
        this._dataSets = dataSets;
        this._isWeDo2SmartHub = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);
        this._isVirtualPort = this.hub.isPortVirtual(portId);

        const eventAttachListener = (event: string) => {
            if (event === "detach") {
                return;
            }
            if (this.autoSubscribe) {
                if (this._modeMap[event] !== undefined) {
                    if (this._supportsCombined && !this.isWeDo2SmartHub) {
                        this.subscribeMulti(this._modeMap[event]);
                    } else {
                        this.subscribeSingle(this._modeMap[event]);
                    }
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

    public get combinedModes () {
        return this._combinedModes;
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

    public subscribeMulti (mode: number) {
        this._ensureConnected();
        if (this.isWeDo2SmartHub) {
            throw new Error("Subscribing to multiple sensor modes is not available on the WeDo 2.0 Smart Hub");
        }
        if (!this._supportsCombined) {
            throw new Error("This sensor does not support subscribing to multiple modes");
        }
        if (this._combinedModes.indexOf(mode) < 0) {
            this._combinedModes.push(mode);
            this.send(Buffer.from([0x42, this.portId, 0x02]));
            const dataSets: number[] = [];
            for (let i = 0; i < this._combinedModes.length; i++) {
                this.send(Buffer.from([0x41, this.portId, this._combinedModes[i], 0x01, 0x00, 0x00, 0x00, 0x01]), Consts.BLECharacteristic.LPF2_ALL);
                for (let j = 0; j < this._dataSets[this._combinedModes[i]]; j++) {
                    dataSets.push((this._combinedModes[i] << 4) + j);
                }
            }
            this.send(Buffer.from([0x42, this.portId, 0x01, 0x00].concat(dataSets)));
            this.send(Buffer.from([0x42, this.portId, 0x03]));
        }
    }

    public subscribeSingle (mode: number) {
        this._ensureConnected();
        if (mode !== this._mode) {
            this._mode = mode;
            if (this.isWeDo2SmartHub) {
                this.send(Buffer.from([0x01, 0x02, this.portId, this.type, mode, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]), Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
            } else {
                this.send(Buffer.from([0x41, this.portId, mode, 0x01, 0x00, 0x00, 0x00, 0x01]), Consts.BLECharacteristic.LPF2_ALL);
            }
        }
    }

    public unsubscribeSingle (mode: number) {
        this._ensureConnected();
        if (this.mode !== undefined) {
            if (this.isWeDo2SmartHub) {
                this.send(Buffer.from([0x01, 0x02, this.portId, this.type, mode, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]), Consts.BLECharacteristic.WEDO2_PORT_TYPE_WRITE);
            } else {
                this.send(Buffer.from([0x41, this.portId, mode, 0x01, 0x00, 0x00, 0x00, 0x00]), Consts.BLECharacteristic.LPF2_ALL);
            }
        }
    }

    public receiveSingle (message: Buffer) {
        if (this.mode !== undefined) {
            message = message.slice(4);
            this.parse(this.mode, message);
        }
    }

    public parse (mode: number, message: Buffer) {
        this.notify("receive", { message });
        return message;
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

}
