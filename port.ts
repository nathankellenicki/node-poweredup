import * as Consts from "./consts";


export class Port {


    public id: string;
    public value: number;
    public connected: boolean;
    public type: Consts.Devices;


    constructor (id: string, value: number) {
        this.id = id;
        this.value = value;
        this.connected = false;
        this.type = Consts.Devices.UNKNOWN;
    }

}
