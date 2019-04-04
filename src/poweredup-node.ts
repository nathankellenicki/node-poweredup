import { Peripheral } from "noble-mac";

import { BoostMoveHub } from "./boostmovehub";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { NobleDevice } from "./nobledevice";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";

import * as Consts from "./consts";

import { EventEmitter } from "events";

import Debug = require("debug");
const debug = Debug("poweredup");
import noble = require("noble-mac");

let ready = false;
let wantScan = false;
let discoveryEventAttached = false;

const startScanning = () => {
    noble.startScanning();
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
        this._discoveryEventHandler = this._discoveryEventHandler.bind(this);
    }


    /**
     * Begin scanning for Powered UP Hub devices.
     * @method PoweredUP#scan
     */
    public async scan () {
        wantScan = true;

        if (!discoveryEventAttached) {
            noble.on("discover", this._discoveryEventHandler);
            discoveryEventAttached = true;
        }

        if (ready) {
            debug("Scanning started");
            startScanning();
        }

        return true;
    }


    /**
     * Stop scanning for Powered UP Hub devices.
     * @method PoweredUP#stop
     */
    public stop () {
        wantScan = false;

        if (discoveryEventAttached) {
            noble.removeListener("discover", this._discoveryEventHandler);
            discoveryEventAttached = false;
        }

        noble.stopScanning();
    }


    /**
     * Retrieve a list of Powered UP Hubs.
     * @method PoweredUP#getConnectedHubs
     * @returns {Hub[]}
     */
    public getConnectedHubs () {
        return Object.keys(this._connectedHubs).map((uuid) => this._connectedHubs[uuid]);
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
     * Retrieve a list of Powered UP Hub by name.
     * @method PoweredUP#getConnectedHubsByName
     * @param {string} name
     * @returns {Hub[]}
     */
    public getConnectedHubsByName (name: string) {
        return Object.keys(this._connectedHubs).map((uuid) => this._connectedHubs[uuid]).filter((hub) => hub.name === name);
    }


    private async _discoveryEventHandler (peripheral: Peripheral) {

        const device = new NobleDevice(peripheral);

        let hub: Hub;

        if (await WeDo2SmartHub.IsWeDo2SmartHub(peripheral)) {
            hub = new WeDo2SmartHub(device, this.autoSubscribe);
        } else if (await BoostMoveHub.IsBoostMoveHub(peripheral)) {
            hub = new BoostMoveHub(device, this.autoSubscribe);
        } else if (await PUPHub.IsPUPHub(peripheral)) {
            hub = new PUPHub(device, this.autoSubscribe);
        } else if (await PUPRemote.IsPUPRemote(peripheral)) {
            hub = new PUPRemote(device, this.autoSubscribe);
        } else if (await DuploTrainBase.IsDuploTrainBase(peripheral)) {
            hub = new DuploTrainBase(device, this.autoSubscribe);
        } else {
            return;
        }

        peripheral.removeAllListeners();

        device.on("discoverComplete", () => {

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

    }

}
