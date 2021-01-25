import { FakeBLEDevice } from "../utils/fakebledevice";
import {commonsConnectTests, includeMessage } from '../utils/commons';

import { TechnicMediumHub } from "../../src/hubs/technicmediumhub";

export default function technicMediumHub() {
  const state = { connectEvent: false };
  const bleDevice = new FakeBLEDevice("fakebledevice", "Technic Medium Hub")
  const hub = new TechnicMediumHub(bleDevice);
  hub.on("connect", () => state.connectEvent = true);

  describe("connect", () => {
    before(async () => await hub.connect());
    commonsConnectTests(state, hub, bleDevice);
  });

}
