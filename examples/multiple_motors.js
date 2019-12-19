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

    const motorA = await hub.waitForDeviceAtPort("A");
    console.log("Got motor A");
    const motorB = await hub.waitForDeviceAtPort("B");
    console.log("Got motor B");
    const motorC = await hub.waitForDeviceAtPort("C");
    console.log("Got motor C");
    const motorD = await hub.waitForDeviceAtPort("D");
    console.log("Got motor D");

    motorA.setPower(30);
    motorB.setPower(30);
    motorC.setPower(30);
    motorD.setPower(30);

    hub.on("disconnect", () => {
        console.log("Hub disconnected");
    });

});