const LPF2 = require("..").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

lpf2.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log("Connected to Hub!");

});

let color = 0;
setInterval(() => {

    const hubs = lpf2.getConnectedDevices(); // Get an array of all connected hubs
    hubs.forEach((hub) => {
        hub.setLEDColor(color); // Set the color
    })
    color++;
    if (color > 10) {
        color = 0;
    }

}, 2000);