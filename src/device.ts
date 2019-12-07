import { EventEmitter } from "events";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class Device extends EventEmitter {

    private _hub: Hub;
    private _portId: number;
    private _connected: boolean = true;
    private _type: number;
    private _busy: boolean = false;
    private _finished: (() => void) | null = null;

    constructor (hub: Hub, portId: number, type: number = Consts.DeviceType.UNKNOWN) {
        super();
        this._hub = hub;
        this._portId = portId;
        this._type = type;
        this.hub.on("detach", (device) => {
            if (device.portId === this.portId) {
                this._connected = false;
                this.emit("detach");
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

    public get port () {
        return this.hub.getPortNameForPortId(this.portId);
    }

    public get type () {
        return this._type;
    }

    public send (data: Buffer, characteristic: string = Consts.BLECharacteristic.LPF2_ALL, callback?: () => void) {
        this.hub.send(data, characteristic, callback);
    }

    public subscribe (mode: number) {
        this.send(Buffer.from([0x41, this.portId, mode, 0x01, 0x00, 0x00, 0x00, 0x01]));
    }

}
