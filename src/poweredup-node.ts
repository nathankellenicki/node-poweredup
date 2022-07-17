import { Peripheral } from "@abandonware/noble";

import { NobleDevice } from "./nobleabstraction";

import { BaseHub } from "./hubs/basehub";
import { DuploTrainBase } from "./hubs/duplotrainbase";
import { Hub } from "./hubs/hub";
import { Mario } from "./hubs/mario";
import { MoveHub } from "./hubs/movehub";
import { RemoteControl } from "./hubs/remotecontrol";
import { TechnicMediumHub } from "./hubs/technicmediumhub";
import { WeDo2SmartHub } from "./hubs/wedo2smarthub";

import * as Consts from "./consts";

import { EventEmitter } from "events";

import Debug = require("debug");
const debug = Debug("poweredup");
import noble = require("@abandonware/noble");
import { TechnicSmallHub } from "./hubs/technicsmallhub";

let ready = false;
let wantScan = false;

const startScanning = () => {
    noble.startScanning([
        Consts.BLEService.LPF2_HUB,
        Consts.BLEService.LPF2_HUB.replace(/-/g, ""),
        Consts.BLEService.WEDO2_SMART_HUB,
        Consts.BLEService.WEDO2_SMART_HUB.replace(/-/g, "")
    ]);
};

noble.on("stateChange", (state: string) => {
    ready = (state === "poweredOn");
    if (ready) {
        if (wantScan) {
            debug("Scanning started");
            startScanning();
        }
        noble.on('scanStop', () => {
            setTimeout(() => {
                startScanning();
            }, 1000);
        });
    } else {
        noble.stopScanning();
    }
});

/**
 * @class PoweredUP
 * @extends EventEmitter
 */
export class PoweredUP extends EventEmitter {


    private _connectedHubs: {[uuid: string]: BaseHub} = {};


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
        // @ts-ignore
        noble.on("discover", this._discoveryEventHandler);

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
        // @ts-ignore
        noble.removeListener("discover", this._discoveryEventHandler);
        noble.stopScanning();
    }


    /**
     * Retrieve a list of Powered UP Hubs.
     * @method PoweredUP#getHubs
     * @returns {BaseHub[]}
     */
    public getHubs () {
        return Object.values(this._connectedHubs);
    }


    /**
     * Retrieve a Powered UP Hub by UUID.
     * @method PoweredUP#getHubByUUID
     * @param {string} uuid
     * @returns {BaseHub | null}
     */
    public getHubByUUID (uuid: string) {
        return this._connectedHubs[uuid];
    }


    /**
     * Retrieve a Powered UP Hub by primary MAC address.
     * @method PoweredUP#getHubByPrimaryMACAddress
     * @param {string} address
     * @returns {BaseHub}
     */
    public getHubByPrimaryMACAddress (address: string) {
        return Object.values(this._connectedHubs).filter((hub) => hub.primaryMACAddress === address)[0];
    }


    /**
     * Retrieve a list of Powered UP Hub by name.
     * @method PoweredUP#getHubsByName
     * @param {string} name
     * @returns {BaseHub[]}
     */
    public getHubsByName (name: string) {
        return Object.values(this._connectedHubs).filter((hub) => hub.name === name);
    }


    /**
     * Retrieve a list of Powered UP Hub by type.
     * @method PoweredUP#getHubsByType
     * @param {string} name
     * @returns {BaseHub[]}
     */
    public getHubsByType (hubType: number) {
        return Object.values(this._connectedHubs).filter((hub) => hub.type === hubType);
    }


    private async _discoveryEventHandler (peripheral: Peripheral) {

        peripheral.removeAllListeners();
        const device = new NobleDevice(peripheral);

        let hub: BaseHub;

        if (WeDo2SmartHub.IsWeDo2SmartHub(peripheral)) {
            hub = new WeDo2SmartHub(device);
        } else if (MoveHub.IsMoveHub(peripheral)) {
            hub = new MoveHub(device);
        } else if (Hub.IsHub(peripheral)) {
            hub = new Hub(device);
        } else if (RemoteControl.IsRemoteControl(peripheral)) {
            hub = new RemoteControl(device);
        } else if (DuploTrainBase.IsDuploTrainBase(peripheral)) {
            hub = new DuploTrainBase(device);
        } else if (TechnicSmallHub.IsTechnicSmallHub(peripheral)) {
            hub = new TechnicSmallHub(device);
        } else if (TechnicMediumHub.IsTechnicMediumHub(peripheral)) {
            hub = new TechnicMediumHub(device);
        } else if (Mario.IsMario(peripheral)) {
            hub = new Mario(device);
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
             * @param {WeDo2SmartHub | MoveHub | TechnicMediumHub | RemoteControl | DuploTrainBase} hub
             */
            this.emit("discover", hub);

        });

    }

}
