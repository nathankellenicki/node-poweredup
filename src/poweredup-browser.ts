import { WebBLEDevice } from "./webbleabstraction";

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
import { IBLEAbstraction } from "./interfaces";
import { TechnicSmallHub } from "./hubs/technicsmallhub";
const debug = Debug("poweredup");


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

        try {

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
            return true;

        } catch (err) {
            return false;
        }

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


    private _determineLPF2HubType (device: IBLEAbstraction): Promise<Consts.HubType> {
        return new Promise((resolve) => {
            let buf: Buffer = Buffer.alloc(0);
            device.subscribeToCharacteristic(Consts.BLECharacteristic.LPF2_ALL, (data: Buffer) => {
                buf = Buffer.concat([buf, data]);
                while (buf[0] <= buf.length) {
                    const len = buf[0];
                    const message = buf.slice(0, len);
                    buf = buf.slice(len);
                    if (message[2] === 0x01 && message[3] === 0x0b) {
                        switch (message[5]) {
                            case Consts.BLEManufacturerData.REMOTE_CONTROL_ID:
                                resolve(Consts.HubType.REMOTE_CONTROL);
                                break;
                            case Consts.BLEManufacturerData.MOVE_HUB_ID:
                                resolve(Consts.HubType.MOVE_HUB);
                                break;
                            case Consts.BLEManufacturerData.HUB_ID:
                                resolve(Consts.HubType.HUB);
                                break;
                            case Consts.BLEManufacturerData.DUPLO_TRAIN_BASE_ID:
                                resolve(Consts.HubType.DUPLO_TRAIN_BASE);
                                break;
                            case Consts.BLEManufacturerData.TECHNIC_SMALL_HUB_ID:
                                resolve(Consts.HubType.TECHNIC_SMALL_HUB);
                                break;
                            case Consts.BLEManufacturerData.TECHNIC_MEDIUM_HUB_ID:
                                resolve(Consts.HubType.TECHNIC_MEDIUM_HUB);
                                break;
                        }
                        debug("Hub type determined");
                    } else {
                        debug("Stashed in mailbox (LPF2_ALL)", message);
                        device.addToCharacteristicMailbox(Consts.BLECharacteristic.LPF2_ALL, message);
                    }
                }
            });
            device.writeToCharacteristic(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x05, 0x00, 0x01, 0x0b, 0x05]));
        });
    }


    private async _discoveryEventHandler (server: BluetoothRemoteGATTServer) {

        const device = new WebBLEDevice(server);

        let hub: BaseHub;

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

        if (isLPF2Hub) {
            hubType = await this._determineLPF2HubType(device);
        }

        switch (hubType) {
            case Consts.HubType.WEDO2_SMART_HUB:
                hub = new WeDo2SmartHub(device);
                break;
            case Consts.HubType.MOVE_HUB:
                hub = new MoveHub(device);
                break;
            case Consts.HubType.HUB:
                hub = new Hub(device);
                break;
            case Consts.HubType.REMOTE_CONTROL:
                hub = new RemoteControl(device);
                break;
            case Consts.HubType.DUPLO_TRAIN_BASE:
                hub = new DuploTrainBase(device);
                break;
            case Consts.HubType.TECHNIC_SMALL_HUB:
                hub = new TechnicSmallHub(device);
                break;
            case Consts.HubType.TECHNIC_MEDIUM_HUB:
                hub = new TechnicMediumHub(device);
                break;
            case Consts.HubType.MARIO:
                hub = new Mario(device);
                break;
            default:
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
