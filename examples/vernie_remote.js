const LPF2 = require("..");

const lpf2 = new LPF2.LPF2();
lpf2.scan(); // Start scanning for Vernie

console.log("Looking for Vernie (Please turn on the Hub now)...");

let vernie = null;
let remote = null;

lpf2.on("discover", async (hub) => { // Wait to discover Vernie

    if (hub.type === LPF2.Consts.Hubs.BOOST_MOVE_HUB) {
        vernie = hub;
        await vernie.connect();
        console.log("Connected to Vernie!");


    } else if (hub.type === LPF2.Consts.Hubs.POWERED_UP_REMOTE) {
        remote = hub;

        remote.on("button", (button, state) => {
            switch (state) {
                case LPF2.Consts.ButtonStates.UP:
                {
                    vernie && vernie.setMotorSpeed(button === "LEFT" ? "A" : "B", 50);
                    break;
                }
                case LPF2.Consts.ButtonStates.DOWN:
                {
                    vernie && vernie.setMotorSpeed(button === "LEFT" ? "A" : "B", -50);
                    break;
                }
                case LPF2.Consts.ButtonStates.RELEASED:
                {
                    vernie && vernie.setMotorSpeed(button === "LEFT" ? "A" : "B", 0);
                    break;
                }
            }
        })

        await remote.connect();
        console.log("Connected to Powered Up Remote!");
    }

    if (vernie && remote) {
        console.log("You're now ready to go!");
    }
    
});