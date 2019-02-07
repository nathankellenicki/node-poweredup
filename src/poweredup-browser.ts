import { BLEDevice } from "./bledevice";
import { BoostMoveHub } from "./boostmovehub";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";

import * as Consts from "./consts";

import { EventEmitter } from "events";

import Debug = require("debug");
const debug = Debug("poweredup");


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

        const device = await navigator.bluetooth.requestDevice({
            filters: [
                {
                    services: [
                        Consts.BLEService.WEDO2_SMART_HUB
                    ]
                },
                {
                    services: [
                        Consts.BLEService.LPF2_HUB
                    ]
                }
            ],
            optionalServices: [
                Consts.BLEService.WEDO2_SMART_HUB_2,
                "battery_service",
                "device_information"
            ]
        });

        // @ts-ignore
        const server = await device.gatt.connect();
        this._discoveryEventHandler.call(this, server);

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


    private async _discoveryEventHandler (server: BluetoothRemoteGATTServer) {

        const device = new BLEDevice(server);

        let hub: Hub;

        let hubType = Consts.HubType.UNKNOWN;
        let isLPF2Hub = false;
        try {
            await device.discoverCharacteristicsForService(Consts.BLEService.WEDO2_SMART_HUB);
            hubType = Consts.HubType.WEDO2_SMART_HUB;
        // tslint:disable-next-line
        } catch (error) {}
        try {
            if (hubType !== Consts.HubType.WEDO2_SMART_HUB) {
                await device.discoverCharacteristicsForService(Consts.BLEService.LPF2_HUB);
                isLPF2Hub = true;
            }
        // tslint:disable-next-line
        } catch (error) {}

        hub = new WeDo2SmartHub(device, this.autoSubscribe);

        device.on("discoverComplete", () => {

            hub.on("connect", () => {
                debug(`Hub ${hub.uuid} connected`);
                this._connectedHubs[hub.uuid] = hub;
            });

            hub.on("disconnect", () => {
                debug(`Hub ${hub.uuid} disconnected`);
                delete this._connectedHubs[hub.uuid];
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
