import { EventEmitter } from "events";

import * as Consts from "./consts";

export interface IBLEAbstraction extends EventEmitter {
    uuid: string;
    name: string;
    connecting: boolean;
    connected: boolean;
    connect: () => Promise<any>;
    disconnect: () => Promise<any>;
    discoverCharacteristicsForService: (uuid: string) => Promise<any>;
    subscribeToCharacteristic: (uuid: string, callback: (data: Buffer) => void) => void;
    addToCharacteristicMailbox: (uuid: string, data: Buffer) => void;
    readFromCharacteristic: (uuid: string, callback: (err: string | null, data: Buffer | null) => void) => void;
    writeToCharacteristic: (uuid: string, data: Buffer, callback?: () => void) => void;
}

export interface IDeviceInterface extends EventEmitter {
    type: Consts.HubType;
    getPortNameForPortId: (portId: number) => string | undefined;
    send: (message: Buffer, uuid: string, callback?: () => void) => void;
    subscribe: (portId: number, deviceType: number, mode: number) => void;
    isPortVirtual: (portId: number) => boolean;
    sleep: (delay: number) => Promise<any>;
}
