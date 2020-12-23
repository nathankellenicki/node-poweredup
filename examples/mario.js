/*
 *
 * This demonstrates connecting to LEGO Super Mario.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Mario...");

poweredUP.on("discover", async (hub) => { // Wait to discover hubs

    if (hub instanceof PoweredUP.Mario) {
        const mario = hub;
        await mario.connect(); // Connect to Mario
        console.log(`Connected to Mario!`);

        mario.on("gesture", (_, { gesture }) => {
            console.log("Gesture", gesture);
        });

        mario.on("pants", (_, { pants }) => {
            console.log("Pants detected", pants);
        });

        mario.on("barcode", (_, { barcode, color }) => {
            if (color) {
                console.log("Color detected", color);
            } else if (barcode) {
                console.log("Barcode detected", barcode);
            }
        });

        mario.on("disconnect", () => {
           console.log("Mario disconnected");
        });
    }

});