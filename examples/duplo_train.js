/*
 *
 * This demonstrates controlling a Duplo Train hub.
 *
 */

import { PoweredUP, DeviceType, DeviceTypeNames, ColorNames } from "../dist/index-node.js";

const poweredUP = new PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);
    await hub.connect(); // Connect to the Hub
    console.log("Connected");

    const motor = await hub.waitForDeviceAtPort("MOTOR");
    const light = await hub.waitForDeviceByType(DeviceTypeNames.HUB_LED);

    console.log("Setting running light to RED for 2 seconds");
    light.setColor(ColorNames.RED);
    await hub.sleep(2000);

    console.log("Setting running light to WHITE for 2 seconds");    
    light.setColor(ColorNames.WHITE);
    await hub.sleep(2000);

    while (true) { // Repeat indefinitely
        console.log("Running motor at speed 100 for 2 seconds, setting light to BLUE");
        light.setColor(ColorNames.BLUE);
        motor.setPower(100); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        await hub.sleep(2000);
        console.log("Running motor at revrese speed 100 for 2 seconds, setting light to GREEN");
        light.setColor(ColorNames.GREEN);
        motor.setPower(-100); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        await hub.sleep(2000);
        motor.brake();
    }
});
