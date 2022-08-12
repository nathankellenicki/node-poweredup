/*
 *
 * This demonstrates connecting a Spike Prime / Mindstorms Inventor Hub with pybricks firmware.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

poweredUP.on("discover", async (hub) => { // Wait to discover hubs
    if(hub.type === PoweredUP.Consts.HubType.PYBRICKS_HUB) {
        await hub.connect(); // If we found a hub with Pybricks firmware, connect to it
        console.log(`Connected to ${hub.name}!`);

        // If the hub transmits something, show it in the console
        hub.on("recieve", (data) => { console.log(data.toString()) });

        hub.stopUserProgram(); // Stop any running user program
        // The hub is now waiting for a user program to be uploaded which will then get executed

        hub.startUserProgram(`
from pybricks.hubs import InventorHub
hub = InventorHub() # We assume the connected hub is an Inventor hub
hub.display.text("Hello node-poweredup!") # Show on the led matrix of the hub
print("finished") # Transmit via bluetooth to the laptop
        `);
    }
});
