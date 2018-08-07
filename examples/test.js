const LPF2 = require("..");

const lpf2 = new LPF2.LPF2();
lpf2.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

lpf2.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log(`Connected to ${hub.name}!`);

    await hub.sleep(4000);

    hub.setMotorAngle("A", 90);
    console.log("Done");

    // while (true) {

    //     await hub.wait([
    //         hub.setMotorSpeed("A", 10, 1000),
    //         hub.setMotorSpeed("B", 10, 1000)
    //     ]);

    //     await hub.wait([
    //         hub.setMotorSpeed("A", -10, 2000),
    //         hub.setMotorSpeed("B", -10, 2000)
    //     ]);

    //     await hub.wait([
    //         hub.setMotorSpeed("A", 10, 1000),
    //         hub.setMotorSpeed("B", 10, 1000)
    //     ]);

    //     await hub.sleep(4000);

    // }

});