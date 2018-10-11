import { Peripheral } from "noble";

import { BoostMoveHub } from "./boostmovehub";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";

import { isBrowserContext } from "./utils";

import * as Consts from "./consts";

import { EventEmitter } from "events";

import Debug = require("debug");
const debug = Debug("PoweredUP");
import noble = require("noble");
import { start } from "repl";

let ready = false;
let wantScan = false;

const startScanning = () => {
    if (isBrowserContext) {
        noble.startScanning([Consts.BLEServices.WEDO2_SMART_HUB, Consts.BLEServices.LPF2_HUB]);
    } else {
        noble.startScanning();
    }
};

noble.on("stateChange", (state: string) => {
    ready = (state === "poweredOn");
    if (ready) {
        if (wantScan) {
            debug("Scanning started");
            startScanning();
        }
    } else {
        noble.stopScanning();
    }
});

/**
 * @class PoweredUP
 * @extends EventEmitter
 */
export class PoweredUP extends EventEmitter {


    public autoSubscribe: boolean = true;


    private _connectedHubs: {[uuid: string]: Hub} = {};


    constructor () {
        super();
    }


    /**
     * Begin scanning for Powered UP Hub devices.
     * @method PoweredUP#scan
     */
    public scan () {
        wantScan = true;

        noble.on("discover", async (peripheral: Peripheral) => {

            let hub: Hub;

            if (await WeDo2SmartHub.IsWeDo2SmartHub(peripheral)) {
                hub = new WeDo2SmartHub(peripheral, this.autoSubscribe);
            } else if (await BoostMoveHub.IsBoostMoveHub(peripheral)) {
                hub = new BoostMoveHub(peripheral, this.autoSubscribe);
            } else if (await PUPHub.IsPUPHub(peripheral)) {
                hub = new PUPHub(peripheral, this.autoSubscribe);
            } else if (await PUPRemote.IsPUPRemote(peripheral)) {
                hub = new PUPRemote(peripheral, this.autoSubscribe);
            } else if (await DuploTrainBase.IsDuploTrainBase(peripheral)) {
                hub = new DuploTrainBase(peripheral, this.autoSubscribe);
            } else {
                return;
            }

            peripheral.removeAllListeners();
            noble.stopScanning();
            if (!isBrowserContext) {
                startScanning();
            }

            hub.on("connect", () => {
                debug(`Hub ${hub.uuid} connected`);
                this._connectedHubs[hub.uuid] = hub;
            });

            hub.on("disconnect", () => {
                debug(`Hub ${hub.uuid} disconnected`);
                delete this._connectedHubs[hub.uuid];

                if (wantScan) {
                    startScanning();
                }
            });

            debug(`Hub ${hub.uuid} discovered`);
            /**
             * Emits when a Powered UP Hub device is found.
             * @event PoweredUP#discover
             * @param {WeDo2SmartHub | BoostMoveHub | PUPHub | PUPRemote | DuploTrainBase} hub
             */
            this.emit("discover", hub);

        });

        if (ready) {
            debug("Scanning started");
            startScanning();
        }
    }


    /**
     * Stop scanning for Powered UP Hub devices.
     * @method PoweredUP#stop
     */
    public stop () {
        wantScan = false;
        noble.stopScanning();
    }


    /**
     * Retrieve a Powered UP Hub by UUID.
     * @method PoweredUP#getConnectedHubByUUID
     * @param {string} uuid
     * @returns {Hub | null}
     */
    public getConnectedHubByUUID (uuid: string) {
        return this._connectedHubs[uuid];
    }


    /**
     * Retrieve a list of Powered UP Hubs.
     * @method PoweredUP#getConnectedHubs
     * @returns {Hub[]}
     */
    public getConnectedHubs () {
        return Object.keys(this._connectedHubs).map((uuid) => this._connectedHubs[uuid]);
    }


}

export default PoweredUP;
export { Hub, WeDo2SmartHub, BoostMoveHub, PUPHub, PUPRemote, Consts };
