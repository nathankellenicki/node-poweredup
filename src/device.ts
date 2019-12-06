import { EventEmitter } from "events";
import { Hub } from "./hub";

import * as Consts from "./consts";

export class Device extends EventEmitter {

    private _hub: Hub;
    private _portId: number;
    private _connected: boolean = true;
    private _type: number;

    constructor (hub: Hub, portId: number, type: number = Consts.DeviceType.UNKNOWN) {
        super();
        this._hub = hub;
        this._portId = portId;
        this._type = type;
        console.log(`New device on ${this._portId} - ${this._type}`);
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
        return "A"; // TODO NK: Look up the port name from the relevant hub
    }

    public get type () {
        return this._type;
    }

    public send (data: Buffer, characteristic: string = Consts.BLECharacteristic.LPF2_ALL, callback?: () => void) {
        this.hub.send(characteristic, data, callback);
    }

}
