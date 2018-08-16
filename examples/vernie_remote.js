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

    if (hub instanceof PoweredUP.BoostMoveHub) {

        vernie = hub;
        await vernie.connect();
        console.log("Connected to Vernie!");

    } else if (hub instanceof PoweredUP.PUPRemote) {
        remote = hub;

        remote.on("button", async (button, state) => {
            if (vernie) {
                switch (state) {
                    case PoweredUP.Consts.ButtonStates.UP: // If up is pressed, move the track forward
                    {
                        vernie.setMotorSpeed(button === "LEFT" ? "A" : "B", 50);
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.DOWN: // If down is pressed, move the track backwards
                    {
                        vernie.setMotorSpeed(button === "LEFT" ? "A" : "B", -50);
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.RELEASED: // Stop the track when the button is released
                    {
                        if (button !== "GREEN") {
                            vernie.setMotorSpeed(button === "LEFT" ? "A" : "B", 0);
                        }
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.STOP: // Move the head left or right when a red button is pressed
                    {
                        await vernie.setMotorAngle("D", 35, button === "LEFT" ? -20 : 20);
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.PRESSED: // Fire when the green button is pressed
                    {
                        if (button === "GREEN") {
                            await vernie.setMotorAngle("D", 80, 20);
                            await vernie.setMotorAngle("D", 80, -20);
                        }
                        break;
                    }
                }
            }
        })

        await remote.connect();
        console.log("Connected to Powered UP Remote!");
    }

    if (vernie && remote) {
        vernie.setLEDColor(PoweredUP.Consts.Colors.BLUE);
        remote.setLEDColor(PoweredUP.Consts.Colors.BLUE);
        console.log("You're now ready to go!");
    }
    
});