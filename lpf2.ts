import { Peripheral } from "noble";

import { BoostHub } from "./boosthub";
import { Hub } from "./hub";
import { WeDo2Hub } from "./wedo2hub";

import { EventEmitter} from "events";

import Debug = require("debug");
const debug = Debug("lpf2");
import noble = require("noble");

let ready = false;
let wantScan = false;

noble.on("stateChange", (state: string) => {
    ready = (state === "poweredOn");
    if (ready) {
        if (wantScan) {
            debug("Scanning started");
            noble.startScanning();
        }
    } else {
        noble.stopScanning();
    }
});

/**
 * @class LPF2
 * @extends EventEmitter
 */
export class LPF2 extends EventEmitter {


    public autoSubscribe: boolean = true;


    private _connectedDevices: {[uuid: string]: Hub} = {};


    constructor () {
        super();
    }


    /**
     * Begin scanning for LPF2 Hub devices.
     * @method LPF2#scan
     */
    public scan () {
        wantScan = true;

        noble.on("discover", (peripheral: Peripheral) => {

            let hub: Hub;

            if (WeDo2Hub.IsWeDo2Hub(peripheral)) {
                hub = new WeDo2Hub(peripheral, this.autoSubscribe);
            } else if (BoostHub.IsBoostHub(peripheral)) {
                hub = new BoostHub(peripheral, this.autoSubscribe);
            } else {
                return;
            }

            peripheral.removeAllListeners();
            noble.stopScanning();
            noble.startScanning();

            hub.on("connect", () => {
                debug(`Hub ${hub.uuid} connected`);
                this._connectedDevices[hub.uuid] = hub;
            });

            hub.on("disconnect", () => {
                debug(`Hub ${hub.uuid} disconnected`);
                delete this._connectedDevices[hub.uuid];

                if (wantScan) {
                    noble.startScanning();
                }

                hub.emit("disconnect");
            });

            debug(`Hub ${hub.uuid} discovered`);
            /**
             * Emits when a LPF2 Hub device is found.
             * @event LPF2#discover
             * @param {Hub} hub
             */
            this.emit("discover", hub);

        });

        if (ready) {
            debug("Scanning started");
            noble.startScanning();
        }
    }


    /**
     * Stop scanning for LPF2 Hub devices.
     * @method LPF2#stop
     */
    public stop () {
        wantScan = false;
        noble.stopScanning();
    }


    /**
     * Retrieve a LPF2 Hub device by UUID
     * @method LPF2#getConnectedDeviceByUUID
     * @param {string} uuid
     * @returns {Hub | null}
     */
    public getConnectedDeviceByUUID (uuid: string) {
        return this._connectedDevices[uuid];
    }


    /**
     * Retrieve a list of LPF2 Hub devices
     * @method LPF2#getConnectedDevices
     * @returns {Hub[]}
     */
    public getConnectedDevices () {
        return Object.keys(this._connectedDevices).map((uuid) => {
            return this._connectedDevices[uuid];
        });
    }


}

export default LPF2;
export { Hub, WeDo2Hub, BoostHub };
