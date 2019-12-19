import { EventEmitter } from "events";

import { IDeviceInterface, IDeviceMode } from "../interfaces";

import * as Consts from "../consts";

export class Device extends EventEmitter {

    public autoSubscribe: boolean = true;

    protected _mode: string | undefined;
    protected _busy: boolean = false;
    protected _finished: (() => void) | undefined;

    private _hub: IDeviceInterface;
    private _portId: number;
    private _connected: boolean = true;
    private _type: Consts.DeviceType;
    private _modes: {[name: string]: IDeviceMode} = {};
    private _eventMap: {[event: string]: string};

    private _isWeDo2SmartHub: boolean;

    constructor (hub: IDeviceInterface, portId: number, modes: {[name: string]: IDeviceMode} = {}, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super();
        this._hub = hub;
        this._portId = portId;
        this._type = type;
        this._modes = modes;
        this._isWeDo2SmartHub = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);

        this._eventMap = Object.keys(modes).reduce(
            (map: {[event: string]: string}, name) => {
                const mode = modes[name];
                if (mode.num[hub.type] !== undefined && mode.event) {
                    map[mode.event] = name;
                }
                return map;
            },
            {}
        );

        const detachListener = (device: Device) => {
            if (device.portId === this.portId) {
                this._connected = false;
                this.hub.removeListener("detach", detachListener);
                this.emit("detach");
            }
        };
        this.hub.on("detach", detachListener);

        this.on("newListener", (event) => {
            if (event === "detach") {
                return;
            }
            if (this.autoSubscribe) {
                if (!this._eventMap[event]) {
                    // TODO : error handling -> no mode for event
                    return;
                }

                this.subscribe(this._eventMap[event]);
            }
        });
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

    public send (data: Buffer, characteristic: string = Consts.BLECharacteristic.LPF2_ALL, callback?: () => void) {
        this._ensureConnected();
        this.hub.send(data, characteristic, callback);
    }

    protected sendWithMode (modeName: string, data: Buffer, characteristic: string = Consts.BLECharacteristic.LPF2_ALL, callback?: () => void) {
        const previousMode = this.mode;
        this.subscribe(modeName);
        this.send(data, characteristic, () => {
            if (previousMode) {
                this.subscribe(previousMode);
                if (callback) {
                    callback();
                }
            }
        });
    }

    protected sendLinearPowerCommand (value: number) {
        return new Promise((resolve) => {
            if (this.isWeDo2SmartHub) {
                const data = Buffer.from([this.portId, 0x01, 0x02, value]);
                this.send(data, Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE);
            } else {
                const data = Buffer.from([0x81, this.portId, 0x11, 0x51, 0x00, value]);
                this.send(data);
            }
            return resolve();
        });
    }

    public subscribe (modeName: string) {
        this._ensureConnected();
        if (modeName !== this._mode) {
            this._mode = modeName;

            const modeNum = this._modes[modeName].num[this.hub.type];
            if (modeNum === undefined) {
                // TODO : error handling -> unsupported mode
                return;
            }
            this.hub.subscribe(this.portId, this.type, modeNum);
        }
    }

    public receive (message: Buffer) {
        if (this._mode === undefined) {
            // TODO : error handling -> no mode defined
            return;
        }

        const mode = this._modes[this._mode];

        if (!mode.values) {
            // TODO : error handling -> no parsing informations
            return;
        }

        const data = [];

        for (let index = 0; index <= message.length; index += Consts.ValueBits[mode.values.type]) {
            switch (mode.values.type) {
                case Consts.ValueType.UInt8: {
                    data.push(message.readUInt8(index));
                    break;
                }
                case Consts.ValueType.Int8: {
                    data.push(message.readInt8(index));
                    break;
                }
                case Consts.ValueType.UInt16: {
                    data.push(message.readUInt16LE(index));
                    break;
                }
                case Consts.ValueType.Int16: {
                    data.push(message.readInt16LE(index));
                    break;
                }
                case Consts.ValueType.UInt32: {
                    data.push(message.readUInt32LE(index));
                    break;
                }
                case Consts.ValueType.Int32: {
                    data.push(message.readInt32LE(index));
                    break;
                }
                case Consts.ValueType.Float: {
                    data.push(message.readFloatLE(index));
                    break;
                }
            }
        }

        if (mode.event) {
            this.emit(
                mode.event,
                ...(mode.transform ? mode.transform(this.hub.type, data) : data)
            );
        }

        return data;
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
