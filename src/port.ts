import * as Consts from "./consts";


export class Port {


    public id: string;
    public value: number;
    public type: Consts.DeviceType;
    public mode: number | null;
    public connected: boolean = false;
    public busy: boolean = false;
    public finished: (() => void) | null = null;

    private _eventTimer: NodeJS.Timer | null = null;

    constructor (id: string, value: number) {
        this.id = id;
        this.value = value;
        this.type = Consts.DeviceType.UNKNOWN;
        this.mode = null;
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
