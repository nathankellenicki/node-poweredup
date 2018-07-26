const LPF2 = require("..").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

lpf2.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log("Connected to Hub!");

    hub.on("color", (port, color) => {

        if (color === LPF2.Consts.Colors.YELLOW) {

            hub.setMotorSpeed("A", 0);
            await hub.wait(2000);
            hub.setMotorSpeed("A", -40);

        } else if (color === LPF2.Consts.Colors.RED) {

            hub.setMotorSpeed("A", 0);
            await hub.wait(2000);
            hub.setMotorSpeed("A", 40);

        }

    });

    await hub.wait(2000);
    hub.setMotorSpeed("A", 40);

});