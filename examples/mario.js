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

        const pants = await mario.waitForDeviceByType(PoweredUP.Consts.DeviceType.MARIO_PANTS_SENSOR);
        pants.on("pants", ({ pants }) => {
            console.log("Pants detected", pants);
        });

        const barcodeSensor = await mario.waitForDeviceByType(PoweredUP.Consts.DeviceType.MARIO_BARCODE_SENSOR);
        barcodeSensor.on("barcode", ({ barcode, color }) => {
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