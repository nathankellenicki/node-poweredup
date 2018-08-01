import { Peripheral } from "noble";

import { BoostMoveHub } from "./boostmovehub";
import { Hub } from "./hub";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2Hub } from "./wedo2hub";

import * as Consts from "./consts";

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


    private _connectedHubs: {[uuid: string]: Hub} = {};


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
            } else if (BoostMoveHub.IsBoostMoveHub(peripheral)) {
                hub = new BoostMoveHub(peripheral, this.autoSubscribe);
            } else if (PUPHub.IsPUPHub(peripheral)) {
                hub = new PUPHub(peripheral, this.autoSubscribe);
            } else if (PUPRemote.IsPUPRemote(peripheral)) {
                hub = new PUPRemote(peripheral, this.autoSubscribe);
            } else {
                return;
            }

            peripheral.removeAllListeners();
            noble.stopScanning();
            noble.startScanning();

            hub.on("connect", () => {
                debug(`Hub ${hub.uuid} connected`);
                this._connectedHubs[hub.uuid] = hub;
            });

            hub.on("disconnect", () => {
                debug(`Hub ${hub.uuid} disconnected`);
                delete this._connectedHubs[hub.uuid];

                if (wantScan) {
                    noble.startScanning();
                }
            });

            debug(`Hub ${hub.uuid} discovered`);
            /**
             * Emits when a LPF2 Hub device is found.
             * @event LPF2#discover
             * @param {WeDo2Hub | LPF2Hub} hub
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
     * Retrieve a LPF2 Hub by UUID.
     * @method LPF2#getConnectedHubByUUID
     * @param {string} uuid
     * @returns {Hub | null}
     */
    public getConnectedHubByUUID (uuid: string) {
        return this._connectedHubs[uuid];
    }


    /**
     * Retrieve a list of LPF2 Hubs.
     * @method LPF2#getConnectedHubs
     * @returns {Hub[]}
     */
    public getConnectedHubs () {
        return Object.keys(this._connectedHubs).map((uuid) => {
            return this._connectedHubs[uuid];
        });
    }


}

export default LPF2;
export { Hub, WeDo2Hub, BoostMoveHub, PUPHub, PUPRemote, Consts };
