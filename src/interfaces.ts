import { EventEmitter } from "events";

import * as Consts from "./consts";

export interface IBLEAbstraction extends EventEmitter {
    uuid: string;
    name: string;
    connecting: boolean;
    connected: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    discoverCharacteristicsForService: (uuid: string) => Promise<void>;
    subscribeToCharacteristic: (uuid: string, callback: (data: Buffer) => void) => void;
    addToCharacteristicMailbox: (uuid: string, data: Buffer) => void;
    readFromCharacteristic: (uuid: string, callback: (err: string | null, data: Buffer | null) => void) => void;
    writeToCharacteristic: (uuid: string, data: Buffer) => Promise<void>;
}

export interface IDeviceInterface extends EventEmitter {
    type: Consts.HubType;
    getPortNameForPortId: (portId: number) => string | undefined;
    send: (message: Buffer, uuid: string) => Promise<void>;
    subscribe: (portId: number, deviceType: number, mode: number) => void;
    isPortVirtual: (portId: number) => boolean;
    sleep: (delay: number) => Promise<any>;
}
