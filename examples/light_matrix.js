/*
 *
 * This demonstrates using the Technic 3x3 Light Matrix, included with the LEGO Education Spike Essentials set.
 *
 * NOTE: The Technic 3x3 Light Matrix is compatible with all Powered UP Hubs, not just the Technic Small Hub included with Spike Essentials.
 */

import { PoweredUP, DeviceType, Color } from "../dist/index-node.js";

const poweredUP = new PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

poweredUP.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log(`Connected to ${hub.name}!`);

    const matrix = await hub.waitForDeviceByType(DeviceType.TECHNIC_3X3_COLOR_LIGHT_MATRIX);

    // setMatrix accepts an array of 9 items - Either standard color values (number), or Color objects with brightness (brightness values are 0 to 100%)
    // It can also accept just a single color to set all 9 lights to the same color
    matrix.setMatrix([
        // Red at 100%, green at 20%, red at 100%
        Color.RED, new Color(Color.GREEN, 20), Color.RED,
        // Green at 100%, yellow at 100%, green at 100%
        Color.GREEN, Color.YELLOW, Color.GREEN,
        // Red at 100%, green at 20%, red at 100%
        Color.RED, new Color(Color.GREEN, 20), Color.RED,
    ]);

    hub.on("disconnect", () => {
        console.log("Hub disconnected");
    })

});
