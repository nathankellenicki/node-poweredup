import { strictEqual, ok } from "assert";

import { FakeBLEDevice } from "./fakebledevice";
import { BaseHub } from "../../src/index-node";
import * as Consts from "../../src/consts";

export function includeMessage(bleDevice: FakeBLEDevice, message: string) {
    if (!bleDevice.messages[Consts.BLECharacteristic.LPF2_ALL].includes(message)) {
        throw new Error(`BleDevice did not sent ${message}`);
    }
}

export function commonsConnectTests(state = { connectEvent: false }, hub: BaseHub, bleDevice: FakeBLEDevice, firmware = "1.0.00.0000") {
    it("should have emmited a connect event", () => ok(state.connectEvent));
    it(`should have a uuid (${bleDevice.uuid})`, () => strictEqual(hub.uuid, bleDevice.uuid));
    it(`should have a name (${bleDevice.name})`, () => strictEqual(hub.name, bleDevice.name));
    it(`should have a firmware revision (${firmware})`, () => strictEqual(hub.firmwareVersion, firmware));
    it("should have a hardware revision (1.0.00.0000)", () => strictEqual(hub.hardwareVersion, "1.0.00.0000"));
    it("should have as primary mac address (00:00:00:00:00:00)", () => strictEqual(hub.primaryMACAddress, "00:00:00:00:00:00"));
    it("should have subscribed to BUTTON updates", () => includeMessage(bleDevice, "0500010202"));
    it("should have subscribed to RSSI updates", () => includeMessage(bleDevice, "0500010502"));
    it("should have subscribed to battery level updates", () => includeMessage(bleDevice, "0500010602"));
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
