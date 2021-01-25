import { ok } from "assert";

import { FakeBLEDevice } from "../utils/fakebledevice";
import { getAttachMessage, includeMessage } from "../utils/commons";

import { LPF2Hub } from "../../src/hubs/lpf2hub";
import * as Consts from "../../src/consts";

import { HubLED } from "../../src/devices/hubled";


export default function hubled() {
    let bleDevice: FakeBLEDevice
    let hub: LPF2Hub;
    let device: HubLED

    beforeEach(async () => {
        bleDevice = new FakeBLEDevice("fakebledevice", "LPF2 Hub");
        hub = new LPF2Hub(bleDevice, {A: 0, B: 1});
        await hub.connect()
        bleDevice.send(getAttachMessage(0, Consts.DeviceType.HUB_LED));
        device = await hub.waitForDeviceByType(Consts.DeviceType.HUB_LED) as HubLED;
    })

    it('should set color to BLUE using color codes', () => {
        device.setColor(Consts.Color.BLUE)
        includeMessage(bleDevice, "0a004100000100000001"); // Set mode to COLOR
        includeMessage(bleDevice, "0800810011510003"); // Send color command
    })

    it('should set color to RED using RGB', () => {
        device.setRGB(255, 0, 0)
        includeMessage(bleDevice, "0a004100010100000001"); // Set mode to RGB
        includeMessage(bleDevice, "0a008100115101ff0000"); // Send color command
    })
}
