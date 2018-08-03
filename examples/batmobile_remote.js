const LPF2 = require("..");

const lpf2 = new LPF2.LPF2();
lpf2.scan(); // Start scanning

console.log("Looking for Batmobile and Remote...");

let batmobile = null;
let remote = null;

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
                        batmobile.setMotorSpeed(button === "LEFT" ? "A" : "B", 50);
                        break;
                    }
                    case LPF2.Consts.ButtonStates.DOWN: // If down is pressed, move the wheels backwards
                    {
                        batmobile.setMotorSpeed(button === "LEFT" ? "A" : "B", -50);
                        break;
                    }
                    case LPF2.Consts.ButtonStates.RELEASED: // Stop the wheels when the button is released
                    {
                        if (button !== "GREEN") {
                            batmobile.setMotorSpeed(button === "LEFT" ? "A" : "B", 0);
                        }
                        break;
                    }
                    case LPF2.Consts.ButtonStates.STOP: // When left red button is pressed, do a retreat. When right red button is pressed, scan the area.
                    {
                        if (button === "LEFT") {
                            await batmobile.setMotorSpeed("A", -100, 500);
                            await batmobile.setMotorSpeed("B", -100, 1000);
                            await batmobile.setMotorSpeed("A", -100, 1000);
                            await batmobile.setMotorSpeed("B", -100, 1000);
                            await batmobile.setMotorSpeed("A", -100, 500);
                        } else if (button === "RIGHT") {
                            await batmobile.setMotorSpeed("AB", [100, -100], 1000);
                            await batmobile.setMotorSpeed("AB", [-100, 100], 2000);
                            await batmobile.setMotorSpeed("AB", [100, -100], 2000);
                            await batmobile.setMotorSpeed("AB", [-100, 100], 1000);
                        }
                        break;
                    }
                    case LPF2.Consts.ButtonStates.PRESSED: // Do a wheelie when the green button is pressed
                    {
                        if (button === "GREEN") {
                            await batmobile.setMotorSpeed("AB", -100, 500);
                            await batmobile.setMotorSpeed("AB", 100, 1000);
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