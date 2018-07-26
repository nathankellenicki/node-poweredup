const LPF2 = require("..").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

lpf2.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log("Connected to Hub!");

    await hub.wait(2000); // Wait two seconds before starting the train
    hub.setMotorSpeed("A", 40);

    hub.on("color", (port, color) => {

        if (color === LPF2.Consts.Colors.YELLOW) { // If yellow is seen, stop the train, wait two seconds, and reverse direction

            hub.setMotorSpeed("A", 0);
            await hub.wait(2000);
            hub.setMotorSpeed("A", -40);

        } else if (color === LPF2.Consts.Colors.RED) { // If red is seen, stop the train, wait two seconds, and reverse direction

            hub.setMotorSpeed("A", 0);
            await hub.wait(2000);
            hub.setMotorSpeed("A", 40);

        }

    });

});