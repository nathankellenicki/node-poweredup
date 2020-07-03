import { equal, ok } from "assert";

import { FakeBLEDevice } from "./fakebledevice";
import { BaseHub } from "../../src/index-node";
import * as Consts from "../../src/consts";

export function commonsConnectTests(state = { connectEvent: false }, hub: BaseHub, bleDevice: FakeBLEDevice, firmware = "1.0.00.0000") {
    it("should have emmited a connect event", () => ok(state.connectEvent));
    it(`should have a uuid (${bleDevice.uuid})`, () => equal(hub.uuid, bleDevice.uuid));
    it(`should have a name (${bleDevice.name})`, () => equal(hub.name, bleDevice.name));
    it(`should have a firmware revision (${firmware})`, () => equal(hub.firmwareVersion, firmware));
    it("should have a hardware revision (1.0.00.0000)", () => equal(hub.hardwareVersion, "1.0.00.0000"));
    it("should have as primary mac address (00:00:00:00:00:00)", () => equal(hub.primaryMACAddress, "00:00:00:00:00:00"));
    it("should have subscribed to BUTTON updates", () => ok(bleDevice.messages[Consts.BLECharacteristic.LPF2_ALL].includes("0500010202")));
    it("should have subscribed to RSSI updates", () => ok(bleDevice.messages[Consts.BLECharacteristic.LPF2_ALL].includes("0500010502")));
    it("should have subscribed to battery level updates", () => ok(bleDevice.messages[Consts.BLECharacteristic.LPF2_ALL].includes("0500010602")));
}

export function versionToInt32(version: string): number {
    return parseInt(version.replace(/\./g, ''), 16);
}

export function getAttachMessage(port: number, type: number, firmware: string = "1.0.00.0000", hardware: string = "1.0.00.0000"): Buffer {
    const message = Buffer.alloc(13);
    message[0] = 0x04; // port event
    message[1] = port;
    message[2] = 0x01; // attach event
    message.writeUInt16LE(type, 3);
    message.writeUInt32LE(versionToInt32(firmware), 5);
    message.writeUInt32LE(versionToInt32(hardware), 9);
    return message;
}
