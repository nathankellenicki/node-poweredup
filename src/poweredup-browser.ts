import { BoostMoveHub } from "./boostmovehub";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WebBLEDevice } from "./webbledevice";
import { WeDo2SmartHub } from "./wedo2smarthub";

import * as Consts from "./consts";

import { EventEmitter } from "events";

import Debug = require("debug");
import { IBLEDevice } from "./interfaces";
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


    private _determineLPF2HubType (device: IBLEDevice): Promise<Consts.HubType> {
        return new Promise((resolve, reject) => {
            let buf: Buffer = Buffer.alloc(0);
            device.subscribeToCharacteristic(Consts.BLECharacteristic.LPF2_ALL, (data: Buffer) => {
                buf = Buffer.concat([buf, data]);
                const len = buf[0];
                if (len >= buf.length) {
                    const message = buf.slice(0, len);
                    buf = buf.slice(len);
                    if (message[2] === 0x01 && message[3] === 0x0b) {
                        process.nextTick(() => {
                            switch (message[5]) {
                                case Consts.BLEManufacturerData.POWERED_UP_REMOTE_ID:
                                    resolve(Consts.HubType.POWERED_UP_REMOTE);
                                    break;
                                case Consts.BLEManufacturerData.BOOST_MOVE_HUB_ID:
                                    resolve(Consts.HubType.BOOST_MOVE_HUB);
                                    break;
                                case Consts.BLEManufacturerData.POWERED_UP_HUB_ID:
                                    resolve(Consts.HubType.POWERED_UP_HUB);
                                    break;
                                case Consts.BLEManufacturerData.DUPLO_TRAIN_HUB_ID:
                                    resolve(Consts.HubType.DUPLO_TRAIN_HUB);
                                    break;
                            }
                        });
                    } else {
                        device.addToCharacteristicMailbox(Consts.BLECharacteristic.LPF2_ALL, message);
                    }
                }
            });
            device.writeToCharacteristic(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x05, 0x00, 0x01, 0x0b, 0x05]));
        });
    }


    private async _discoveryEventHandler (server: BluetoothRemoteGATTServer) {

        const device = new WebBLEDevice(server);

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

        if (isLPF2Hub) {
            hubType = await this._determineLPF2HubType(device);
        }

        switch (hubType) {
            case Consts.HubType.WEDO2_SMART_HUB:
                hub = new WeDo2SmartHub(device, this.autoSubscribe);
                break;
            case Consts.HubType.BOOST_MOVE_HUB:
                hub = new BoostMoveHub(device, this.autoSubscribe);
                break;
            case Consts.HubType.POWERED_UP_HUB:
                hub = new PUPHub(device, this.autoSubscribe);
                break;
            case Consts.HubType.POWERED_UP_REMOTE:
                hub = new PUPRemote(device, this.autoSubscribe);
                break;
            case Consts.HubType.DUPLO_TRAIN_HUB:
                hub = new DuploTrainBase(device, this.autoSubscribe);
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
             * @param {WeDo2SmartHub | BoostMoveHub | PUPHub | PUPRemote | DuploTrainBase} hub
             */
            this.emit("discover", hub);

        });

    }

}
