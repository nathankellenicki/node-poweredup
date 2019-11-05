import { EventEmitter } from "events";

export interface IBLEDevice extends EventEmitter {
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
