import { rejects } from "assert";

import { FakeBLEDevice } from "../utils/fakebledevice";
import {commonsConnectTests } from '../utils/commons';

import { MoveHub } from "../../src/hubs/movehub";

export default function moveHub() {
  const state = { connectEvent: false };
  const bleDevice = new FakeBLEDevice("fakebledevice", "Boost Move Hub", "2.0.00.0017")
  const hub = new MoveHub(bleDevice);
  hub.on("connect", () => state.connectEvent = true);

  describe("connect", () => {
    before(async () => await hub.connect());
    it("should reject due to unsupported firmware (<2.0.00.0017)", async () => {
      const badHub = new MoveHub(new FakeBLEDevice("fakebledevice", "PoweredUp Hub", "2.0.00.0016"));
      await rejects(
        async () => await badHub.connect(),
        { name: "Error", message: "Your Move Hub's (PoweredUp Hub) firmware is out of date and unsupported by this library. Please update it via the official Powered Up app." }
      )
    });
    commonsConnectTests(state, hub, bleDevice, "2.0.00.0017");
  });

}
