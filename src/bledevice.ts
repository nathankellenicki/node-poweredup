import { Peripheral } from "noble";

import Debug = require("debug");
const debug = Debug("bledevice");


export class BLEDevice {


     // @ts-ignore
    private _noblePeripheral: Peripheral | null;
    private _webBLEServer: any;


    constructor (device: Peripheral | BluetoothRemoteGATTServer) {
        if (device instanceof Peripheral) {
            this._noblePeripheral = device;
        } else {
            this._webBLEServer = device;
        }
    }


    public discoverService (uuid: string) {
        if (this._peripheral instanceof BluetoothRemoteGATTServer) {

        }
    }


}