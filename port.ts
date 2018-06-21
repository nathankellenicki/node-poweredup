import * as Consts from "./consts";


export class Port {


    public id: string;
    public value: number;
    public connected: boolean;
    public type: Consts.Devices;
    public busy: boolean;
    public finished: (() => void) | null;


    constructor (id: string, value: number) {
        this.id = id;
        this.value = value;
        this.connected = false;
        this.busy = false;
        this.finished = null;
        this.type = Consts.Devices.UNKNOWN;
    }

}
