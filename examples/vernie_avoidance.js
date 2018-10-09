/*
 *
 * This example allows you to connect Vernie and a Powered UP Remote Control to your laptop, and enables the control of Vernie with the Remote.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning

console.log("Looking for Vernie...");

const Modes = {
    AVOIDING: 0,
    MOVING: 1
}

poweredUP.on("discover", async (hub) => { // Wait to discover Vernie and Remote

    const vernie = hub;
    await vernie.connect();
    console.log("Connected to Vernie!");

    let mode = Modes.MOVING;

    vernie.setMotorSpeed("AB", 50);

    vernie.on("distance", async (port, distance) => {

        if (distance < 180 && mode === Modes.MOVING) {
            mode = Modes.AVOIDING;
            await vernie.setMotorSpeed("AB", 0, 1000);
            await vernie.setMotorSpeed("AB", -20, 1000);
            await vernie.setMotorSpeed("AB", 0, 1000);
            vernie.setMotorSpeed("A", 30, 500);
            await vernie.setMotorSpeed("B", -30, 500);
            await vernie.setMotorSpeed("AB", 0, 1000);
            vernie.setMotorSpeed("AB", 50);
            mode = Modes.MOVING;
        }

    });

});