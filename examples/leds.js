/*
 *
 * This demonstrates connecting multiple hubs to your laptop. Once connected, all the hubs LED lights will cycle through the same colors simultaneously.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

poweredUP.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log(`Connected to ${hub.name}!`);

    hub.on("disconnect", () => {
        console.log("Hub disconnected");
    })

});

let color = 1;
setInterval(() => {

    const hubs = poweredUP.getHubs(); // Get an array of all connected hubs
    hubs.forEach(async (hub) => {
        const led = await hub.waitForDeviceByType(PoweredUP.Consts.DeviceType.HUB_LED);
        led.setColor(color); // Set the color
    })
    color++;
    if (color > 10) {
        color = 1;
    }

}, 2000);