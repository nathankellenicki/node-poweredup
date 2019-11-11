import * as Consts from "../consts";
import { PUPRemote } from "../pupremote";
import { TestDevice } from "../testdevice";

const device = new TestDevice()
const remote = new PUPRemote(device);


beforeAll((done) => {
    device.on("discoverComplete", async () => {
        await remote.connect();
        device.postToInbox(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x06, 0x00, 0x01, 0x02, 0x06, 0x00]));
        device.postToInbox(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x0f, 0x00, 0x04, 0x00, 0x01, 0x37, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10]));
        device.postToInbox(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x0f, 0x00, 0x04, 0x01, 0x01, 0x37, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10]));
        await remote.sleep(300);
        device.clearOutbox(Consts.BLECharacteristic.LPF2_ALL);
        done();
    });
});


afterAll(async (done) => {
    await remote.disconnect();
    done();
});


test("Set LED color via discrete value", async (done) => {
    remote.setLEDColor(Consts.Color.BLUE);
    expect(await device.readFromOutbox(Consts.BLECharacteristic.LPF2_ALL)).toEqual(Buffer.from([0x0a, 0x00, 0x41, 0x34, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]));
    expect(await device.readFromOutbox(Consts.BLECharacteristic.LPF2_ALL)).toEqual(Buffer.from([0x08, 0x00, 0x81, 0x34, 0x11, 0x51, 0x00, 0x03]));
    done();
});


test("Turn off LED", async (done) => {
    remote.setLEDColor(false);
    expect(await device.readFromOutbox(Consts.BLECharacteristic.LPF2_ALL)).toEqual(Buffer.from([0x0a, 0x00, 0x41, 0x34, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]));
    expect(await device.readFromOutbox(Consts.BLECharacteristic.LPF2_ALL)).toEqual(Buffer.from([0x08, 0x00, 0x81, 0x34, 0x11, 0x51, 0x00, 0x00]));
    done();
});


test("Set LED color via RGB values", async (done) => {
    remote.setLEDRGB(127, 32, 233);
    expect(await device.readFromOutbox(Consts.BLECharacteristic.LPF2_ALL)).toEqual(Buffer.from([0x0a, 0x00, 0x41, 0x34, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00]));
    expect(await device.readFromOutbox(Consts.BLECharacteristic.LPF2_ALL)).toEqual(Buffer.from([0x0a, 0x00, 0x81, 0x34, 0x11, 0x51, 0x01, 0x7f, 0x20, 0xe9]));
    done();
});


test("Ensure buttons are correctly attached", async (done) => {
    expect(remote.getPortDeviceType("LEFT")).toBe(Consts.DeviceType.POWERED_UP_REMOTE_BUTTON);
    expect(remote.getPortDeviceType("RIGHT")).toBe(Consts.DeviceType.POWERED_UP_REMOTE_BUTTON);
    done();
});


test("Ensure UP button press events are emitted", async (done) => {
    remote.on("button", (button, state) => {
        expect(button).toBe("LEFT");
        expect(state).toBe(Consts.ButtonState.UP);
        remote.removeAllListeners();
        done();
    });
    device.postToInbox(Consts.BLECharacteristic.LPF2_ALL, Buffer.from([0x05, 0x00, 0x45, 0x00, 0x01]));
});