/*
 *
 * This example allows you to connect Vernie and a Powered UP Remote Control to your laptop, and enables the control of Vernie with the Remote.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning

console.log("Looking for train and remote...");

const TRAIN_LED_COLOR = PoweredUP.Consts.Color.PURPLE;

let trainHub = null;
let trainMotor = null;
let remoteHub = null;
let remoteButtonLeft = null;
let remoteButtonRight = null;

let currentSpeed = 0;

poweredUP.on("discover", async (hub) => { // Wait to discover Vernie and Remote

    if (hub.type === PoweredUP.Consts.HubType.HUB) {

        trainHub = hub;
        await trainHub.connect();
        const led = await trainHub.waitForDeviceByType(PoweredUP.Consts.DeviceType.HUB_LED);
        trainMotor = await trainHub.waitForDeviceByType(PoweredUP.Consts.DeviceType.MEDIUM_LINEAR_MOTOR);
        led.setColor(TRAIN_LED_COLOR);
        console.log(`Connected to train (${trainHub.name})!`);
        if (trainHub && remoteHub) {
            console.log("You're now ready to go!");
        }

    } else if (hub.type === PoweredUP.Consts.HubType.REMOTE_CONTROL) {
        remoteHub = hub;
        await remoteHub.connect();
        const led = await remoteHub.waitForDeviceByType(PoweredUP.Consts.DeviceType.HUB_LED);
        remoteButtonLeft = await remoteHub.waitForDeviceAtPort("LEFT");
        remoteButtonRight = await remoteHub.waitForDeviceAtPort("RIGHT");
        led.setColor(TRAIN_LED_COLOR);

        remoteButtonLeft.on("remoteButton", ({ event }) => {
            if (trainMotor) {
                if (event === PoweredUP.Consts.ButtonState.UP) {
                    currentSpeed += 10;
                } else if (event === PoweredUP.Consts.ButtonState.DOWN) {
                    currentSpeed -= 10;
                } else if (event === PoweredUP.Consts.ButtonState.STOP) {
                    currentSpeed = 0;
                }
                trainMotor.setSpeed(currentSpeed);
            }
        });

        remoteButtonRight.on("remoteButton", ({ event }) => {
            if (trainMotor) {
                if (event === PoweredUP.Consts.ButtonState.UP) {
                    currentSpeed += 1;
                } else if (event === PoweredUP.Consts.ButtonState.DOWN) {
                    currentSpeed -= 1;
                } else if (event === PoweredUP.Consts.ButtonState.STOP) {
                    currentSpeed = 0;
                }
                trainMotor.setSpeed(currentSpeed);
            }
        });

        console.log(`Connected to remote (${remoteHub.name})!`);
        if (trainHub && remoteHub) {
            console.log("You're now ready to go!");
        }
    }
    
});