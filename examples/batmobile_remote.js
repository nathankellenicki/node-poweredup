/*
 *
 * This example allows you to connect your Batmobile and a Powered UP Remote Control to your laptop, and enables the control of the Batmobile with the Remote.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning

console.log("Looking for Batmobile and Remote...");

let batmobile = null;
let remote = null;

let lastButton = null;

poweredUP.on("discover", async (hub) => { // Wait to Batmobile and Remote

    if (hub instanceof PoweredUP.PUPHub) {

        batmobile = hub;
        await batmobile.connect();
        console.log("Connected to Batmobile!");

    } else if (hub instanceof PoweredUP.PUPRemote) {
        
        remote = hub;
        remote.on("button", async (button, state) => {
            if (batmobile) {
                switch (state) {
                    case PoweredUP.Consts.ButtonStates.UP: // If up is pressed, move the wheels forward
                    {
                        lastButton = state;
                        batmobile.setMotorSpeed(button === "LEFT" ? "B" : "A", button === "LEFT" ? -100 : 100);
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.DOWN: // If down is pressed, move the wheels backwards
                    {
                        lastButton = state;
                        batmobile.setMotorSpeed(button === "LEFT" ? "B" : "A", button === "LEFT" ? 100 : -100);
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.RELEASED: // Stop the wheels when the button is released
                    {
                        if (lastButton === PoweredUP.Consts.ButtonStates.UP || lastButton === PoweredUP.Consts.ButtonStates.DOWN) {
                            batmobile.setMotorSpeed(button === "LEFT" ? "B" : "A", 0);
                        }
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.STOP: // When left red button is pressed, do a retreat. When right red button is pressed, scan the area.
                    {
                        lastButton = state;
                        if (button === "LEFT") {
                            await batmobile.setMotorSpeed("A", -100, 500);
                            await batmobile.setMotorSpeed("B", -100, 1000);
                            await batmobile.setMotorSpeed("A", -100, 1000);
                            await batmobile.setMotorSpeed("B", -100, 1000);
                            await batmobile.setMotorSpeed("A", -100, 500);
                        } else if (button === "RIGHT") {
                            await batmobile.setMotorSpeed("AB", 100, 1000);
                            await batmobile.setMotorSpeed("AB", -100, 2000);
                            await batmobile.setMotorSpeed("AB", 100, 2000);
                            await batmobile.setMotorSpeed("AB", -100, 1000);
                        }
                        break;
                    }
                    case PoweredUP.Consts.ButtonStates.PRESSED: // Do a wheelie when the green button is pressed
                    {
                        lastButton = state;
                        if (button === "GREEN") {
                            batmobile.setMotorSpeed("AB", [-100, 100]);
                            await batmobile.sleep(500);
                            await batmobile.setMotorSpeed("AB", [100, -100], 1000);
                        }
                        break;
                    }
                }
            }
        })

        await remote.connect();
        console.log("Connected to Powered UP Remote!");
    }

    if (batmobile && remote) {
        batmobile.setLEDColor(PoweredUP.Consts.Color.WHITE);
        remote.setLEDColor(PoweredUP.Consts.Color.RED);
        console.log("You're now ready to go!");
    }
    
});