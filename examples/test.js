const LPF2 = require("..").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

lpf2.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log("Connected to Hub!");

    setTimeout(() => {
        hub.setMotorSpeed("A", 50, 500);
        //hub.setMotorSpeed("B", 50);
    }, 3000);

});