/*
 *
 * This example allows you to connect Vernie and a Powered UP Remote Control to your laptop, and enables the control of Vernie with the Remote.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning

console.log("Looking for Vernie and Remote...");

let vernie = null;
let remote = null;

poweredUP.on("discover", async (hub) => { // Wait to discover Vernie and Remote

    if (hub.type === PoweredUP.Consts.HubType.MOVE_HUB) {

        vernie = hub;
        await vernie.connect();
        const led = await vernie.waitForDeviceByType(PoweredUP.Consts.DeviceType.HUB_LED);
        led.setColor(PoweredUP.Consts.Color.BLUE);
        console.log(`Connected to Vernie (${vernie.name})!`);

    } else if (hub.type === PoweredUP.Consts.HubType.REMOTE_CONTROL) {
        remote = hub;

        remote.on("remoteButton", async (device, { event }) => {
            if (vernie) {
                const leftTrack = await vernie.waitForDeviceAtPort("A");
                const rightTrack = await vernie.waitForDeviceAtPort("B");
                const head = await vernie.waitForDeviceAtPort("D");

                console.log(event);

                switch (event) {
                    case PoweredUP.Consts.ButtonState.UP: // If up is pressed, move the track forward
                    {
                        console.log(device.portName);
                        device.portName === "LEFT" ? leftTrack.setSpeed(50) : rightTrack.setSpeed(50);
                        break;
                    }
                    case PoweredUP.Consts.ButtonState.DOWN: // If down is pressed, move the track backwards
                    {
                        device.portName === "LEFT" ? leftTrack.setSpeed(-50) : rightTrack.setSpeed(-50);
                        break;
                    }
                    case PoweredUP.Consts.ButtonState.RELEASED: // Stop the track when the button is released
                    {
                        device.portName === "LEFT" ? leftTrack.setPower(0) : rightTrack.setPower(0);
                        break;
                    }
                    case PoweredUP.Consts.ButtonState.STOP: // Move the head left or right when a red button is pressed
                    {
                        await head.rotateByDegrees(35, device.portName === "LEFT" ? -20 : 20);
                        break;
                    }
                }
            }
        });

        hub.on("button", async ({ event }) => {
            console.log(event);
            if (vernie) {
                const head = await vernie.waitForDeviceAtPort("D");
                if (event === PoweredUP.Consts.ButtonState.PRESSED) {
                    await head.rotateByDegrees(80, 20);
                    await head.rotateByDegrees(80, -20);
                }
            }
        });

        await remote.connect();
        const led = await remote.waitForDeviceByType(PoweredUP.Consts.DeviceType.HUB_LED);
        led.setColor(PoweredUP.Consts.Color.BLUE);
        console.log(`Connected to Powered UP Remote (${remote.name})!`);
    }

    if (vernie && remote) {
        console.log("You're now ready to go!");
    }
    
});