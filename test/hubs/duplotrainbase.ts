import { FakeBLEDevice } from "../utils/fakebledevice";
import {commonsConnectTests } from '../utils/commons';

import { DuploTrainBase } from "../../src/hubs/duplotrainbase";

export default function duploTrainBase() {
  const state = { connectEvent: false };
  const bleDevice = new FakeBLEDevice("fakebledevice", "Duplo Train Base")
  const hub = new DuploTrainBase(bleDevice);
  hub.on("connect", () => state.connectEvent = true);
  describe("connect", () => {
    before(async () => await hub.connect());
    commonsConnectTests(state, hub, bleDevice);
  });
}
