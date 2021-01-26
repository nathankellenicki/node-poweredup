import { rejects } from "assert";

import { FakeBLEDevice } from "../utils/fakebledevice";
import {commonsConnectTests } from '../utils/commons';

import { Hub } from "../../src/hubs/hub";

export default function hub() {
  const state = { connectEvent: false };
  const bleDevice = new FakeBLEDevice("fakebledevice", "PoweredUp Hub", "1.1.00.0004")
  const hub = new Hub(bleDevice);
  hub.on("connect", () => state.connectEvent = true);

  describe("connect", () => {
    before(async () => await hub.connect());
    it("should reject due to unsupported firmware (<1.1.00.0004)", async () => {
      const badHub = new Hub(new FakeBLEDevice("fakebledevice", "PoweredUp Hub", "1.1.00.0003"));
      await rejects(
        async () => await badHub.connect(),
        { name: "Error", message: "Your Powered Up Hub's (PoweredUp Hub) firmware is out of date and unsupported by this library. Please update it via the official Powered Up app." }
      )
    });
    commonsConnectTests(state, hub, bleDevice, "1.1.00.0004");
  });
}
