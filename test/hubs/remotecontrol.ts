import { FakeBLEDevice } from "../utils/fakebledevice";
import {commonsConnectTests } from '../utils/commons';

import { RemoteControl } from "../../src/hubs/remotecontrol";

export default function remoteControl() {
  const state = { connectEvent: false };
  const bleDevice = new FakeBLEDevice("fakebledevice", "Remote controller")
  const hub = new RemoteControl(bleDevice);
  hub.on("connect", () => state.connectEvent = true);
  describe("connect", () => {
    before(async () => await hub.connect());
    commonsConnectTests(state, hub, bleDevice);
  });
}
