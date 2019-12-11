import { Peripheral } from "@abandonware/noble";

import { BoostMoveHub } from "./boostmovehub";
import { ControlPlusHub } from "./controlplushub";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { NobleDevice } from "./nobleabstraction";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";

import * as Consts from "./consts";

import { EventEmitter } from "events";

import Debug = require("debug");
const debug = Debug("poweredup");
import noble = require("@abandonware/noble");

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
     * @method PoweredUP#getHubs
     * @returns {Hub[]}
     */
    public getHubs () {
        return Object.values(this._connectedHubs);
    }


    /**
     * Retrieve a Powered UP Hub by UUID.
     * @method PoweredUP#getHubByUUID
     * @param {string} uuid
     * @returns {Hub | null}
     */
    public getHubByUUID (uuid: string) {
        return this._connectedHubs[uuid];
    }


    /**
     * Retrieve a Powered UP Hub by primary MAC address.
     * @method PoweredUP#getHubByPrimaryMACAddress
     * @param {string} address
     * @returns {Hub}
     */
    public getHubByPrimaryMACAddress (address: string) {
        return Object.values(this._connectedHubs).filter((hub) => hub.primaryMACAddress === address)[0];
    }


    /**
     * Retrieve a list of Powered UP Hub by name.
     * @method PoweredUP#getHubsByName
     * @param {string} name
     * @returns {Hub[]}
     */
    public getHubsByName (name: string) {
        return Object.values(this._connectedHubs).filter((hub) => hub.name === name);
    }


    /**
     * Retrieve a list of Powered UP Hub by type.
     * @method PoweredUP#getHubsByType
     * @param {string} name
     * @returns {Hub[]}
     */
    public getHubsByType (hubType: number) {
        return Object.values(this._connectedHubs).filter((hub) => hub.type === hubType);
    }


    private async _discoveryEventHandler (peripheral: Peripheral) {

        peripheral.removeAllListeners();
        const device = new NobleDevice(peripheral);

        let hub: Hub;

        if (await WeDo2SmartHub.IsWeDo2SmartHub(peripheral)) {
            hub = new WeDo2SmartHub(device);
        } else if (await BoostMoveHub.IsBoostMoveHub(peripheral)) {
            hub = new BoostMoveHub(device);
        } else if (await PUPHub.IsPUPHub(peripheral)) {
            hub = new PUPHub(device);
        } else if (await PUPRemote.IsPUPRemote(peripheral)) {
            hub = new PUPRemote(device);
        } else if (await DuploTrainBase.IsDuploTrainBase(peripheral)) {
            hub = new DuploTrainBase(device);
        } else if (await ControlPlusHub.IsControlPlusHub(peripheral)) {
            hub = new ControlPlusHub(device);
        } else {
            return;
        }

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
             * @param {WeDo2SmartHub | BoostMoveHub | ControlPlusHub | PUPHub | PUPRemote | DuploTrainBase} hub
             */
            this.emit("discover", hub);

        });

    }

}
