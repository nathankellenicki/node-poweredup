import { strictEqual } from "assert";

import { FakeBLEDevice } from "../utils/fakebledevice";
import { getAttachMessage, includeMessage } from "../utils/commons";

import { LPF2Hub } from "../../src/hubs/lpf2hub";
import * as Consts from "../../src/consts";

import { RemoteControlButton, ButtonState } from "../../src/devices/remotecontrolbutton";

export default function remoteControlButton() {
    let bleDevice: FakeBLEDevice
    let hub: LPF2Hub;
    let device: RemoteControlButton;

    function testEvent(eventType: number, eventContant: number) {
        return done => {
            device.on('remoteButton', ({event})=> {
                strictEqual(event, eventContant);
                done()
            });
            const message = Buffer.alloc(3);
            message[0] = 0x45;
            message[1] = 0;
            message[2] = eventType;
            bleDevice.send(message);
        }
    }

    beforeEach(async () => {
        bleDevice = new FakeBLEDevice("fakebledevice", "LPF2 Hub");
        hub = new LPF2Hub(bleDevice, {A: 0, B: 1});
        await hub.connect()
        bleDevice.send(getAttachMessage(0, Consts.DeviceType.REMOTE_CONTROL_BUTTON));
        device = await hub.waitForDeviceByType(Consts.DeviceType.REMOTE_CONTROL_BUTTON) as RemoteControlButton;
    })

    it('should detect UP', testEvent(0x01, ButtonState.UP))
    it('should detect DOWN', testEvent(0xff, ButtonState.DOWN))
    it('should detect STOP', testEvent(0x7f, ButtonState.STOP))
    it('should detect RELEASED', testEvent(0x00, ButtonState.RELEASED))

}
