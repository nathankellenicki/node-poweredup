import { ok } from "assert";

import { FakeBLEDevice } from "../utils/fakebledevice";
import {commonsConnectTests } from '../utils/commons';

import { TechnicMediumHub } from "../../src/hubs/technicmediumhub";
import * as Consts from "../../src/consts";

export default function technicMediumHub() {
  const state = { connectEvent: false };
  const bleDevice = new FakeBLEDevice("fakebledevice", "Technic Medium Hub")
  const hub = new TechnicMediumHub(bleDevice);
  hub.on("connect", () => state.connectEvent = true);

  describe("connect", () => {
    before(async () => await hub.connect());
    commonsConnectTests(state, hub, bleDevice);
    it("should have subscribed to temperature updates", () => ok(bleDevice.messages[Consts.BLECharacteristic.LPF2_ALL].includes("0a00413d000a00000001")));
  });

}
