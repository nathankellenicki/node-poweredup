/*
 *
 * This example allows you to connect your Batmobile and a Powered Up Remote Control to your laptop, and enables the control of the Batmobile with the Remote.
 *
 */

const LPF2 = require("..");

const lpf2 = new LPF2.LPF2();
lpf2.scan(); // Start scanning

console.log("Looking for Batmobile and Remote...");

let batmobile = null;
let remote = null;

let lastButton = null;

lpf2.on("discover", async (hub) => { // Wait to Batmobile and Remote

    if (hub instanceof LPF2.PUPHub) {

        batmobile = hub;
        await batmobile.connect();
        console.log("Connected to Batmobile!");

    } else if (hub instanceof LPF2.PUPRemote) {
        
        remote = hub;
        remote.on("button", async (button, state) => {
            if (batmobile) {
                switch (state) {
                    case LPF2.Consts.ButtonStates.UP: // If up is pressed, move the wheels forward
                    {
                        lastButton = state;
                        batmobile.setMotorSpeed(button === "LEFT" ? "B" : "A", button === "LEFT" ? -100 : 100);
                        break;
                    }
                    case LPF2.Consts.ButtonStates.DOWN: // If down is pressed, move the wheels backwards
                    {
                        lastButton = state;
                        batmobile.setMotorSpeed(button === "LEFT" ? "B" : "A", button === "LEFT" ? 100 : -100);
                        break;
                    }
                    case LPF2.Consts.ButtonStates.RELEASED: // Stop the wheels when the button is released
                    {
                        if (lastButton === LPF2.Consts.ButtonStates.UP || lastButton === LPF2.Consts.ButtonStates.DOWN) {
                            batmobile.setMotorSpeed(button === "LEFT" ? "B" : "A", 0);
                        }
                        break;
                    }
                    case LPF2.Consts.ButtonStates.STOP: // When left red button is pressed, do a retreat. When right red button is pressed, scan the area.
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
                    case LPF2.Consts.ButtonStates.PRESSED: // Do a wheelie when the green button is pressed
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
        console.log("Connected to Powered Up Remote!");
    }

    if (batmobile && remote) {
        batmobile.setLEDColor(LPF2.Consts.Colors.WHITE);
        remote.setLEDColor(LPF2.Consts.Colors.RED);
        console.log("You're now ready to go!");
    }
    
});