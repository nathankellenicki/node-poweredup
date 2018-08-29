import * as Consts from "./consts";


export class Port {


    public id: string;
    public value: number;
    public type: Consts.Devices;
    public connected: boolean = false;
    public busy: boolean = false;
    public finished: (() => void) | null = null;

    private _eventTimer: NodeJS.Timer | null = null;

    constructor (id: string, value: number) {
        this.id = id;
        this.value = value;
        this.type = Consts.Devices.UNKNOWN;
    }

    public cancelEventTimer () {
        if (this._eventTimer) {
            clearTimeout(this._eventTimer);
            this._eventTimer = null;
        }
    }

    public setEventTimer (timer: NodeJS.Timer) {
        this._eventTimer = timer;
    }

}
