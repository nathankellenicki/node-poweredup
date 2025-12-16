/*
 *
 * This example allows you to connect a train and a Powered UP Remote Control to your laptop, and enables the control of the train with the Remote.
 *
 */

import { PoweredUP, HubType, DeviceType, Color, ButtonState } from "../dist/index-node.js";

const poweredUP = new PoweredUP();
poweredUP.scan(); // Start scanning

console.log("Looking for train and remote...");

const TRAIN_LED_COLOR = Color.PURPLE;

let trainHub = null;
let trainMotor = null;
let remoteHub = null;
let remoteButtonLeft = null;
let remoteButtonRight = null;

let currentSpeed = 0;

poweredUP.on("discover", async (hub) => { // Wait to discover Vernie and Remote

    if (hub.type === HubType.HUB) {

        trainHub = hub;
        await trainHub.connect();
        const led = await trainHub.waitForDeviceByType(DeviceType.HUB_LED);
        trainMotor = await trainHub.waitForDeviceByType(DeviceType.MEDIUM_LINEAR_MOTOR);
        led.setColor(TRAIN_LED_COLOR);
        console.log(`Connected to train (${trainHub.name})!`);
        if (trainHub && remoteHub) {
            console.log("You're now ready to go!");
        }

    } else if (hub.type === HubType.REMOTE_CONTROL) {
        remoteHub = hub;
        await remoteHub.connect();
        const led = await remoteHub.waitForDeviceByType(DeviceType.HUB_LED);
        remoteButtonLeft = await remoteHub.waitForDeviceAtPort("LEFT");
        remoteButtonRight = await remoteHub.waitForDeviceAtPort("RIGHT");
        led.setColor(TRAIN_LED_COLOR);

        remoteButtonLeft.on("remoteButton", ({ event }) => {
            if (trainMotor) {
                if (event === ButtonState.UP) {
                    currentSpeed += 10;
                } else if (event === ButtonState.DOWN) {
                    currentSpeed -= 10;
                } else if (event === ButtonState.STOP) {
                    currentSpeed = 0;
                }
                trainMotor.setSpeed(currentSpeed);
            }
        });

        remoteButtonRight.on("remoteButton", ({ event }) => {
            if (trainMotor) {
                if (event === ButtonState.UP) {
                    currentSpeed += 1;
                } else if (event === ButtonState.DOWN) {
                    currentSpeed -= 1;
                } else if (event === ButtonState.STOP) {
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