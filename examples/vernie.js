const LPF2 = require("..").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for Vernie

console.log("Looking for Vernie (Please turn on the Hub now)...");

lpf2.on("discover", async (vernie) => { // Wait to discover Vernie

    let running = false;

    lpf2.stop(); // Stop scanning for Vernie (We've just found him!)
    await vernie.connect(); // Connect to Vernie

    console.log("Connected to Vernie!");
    
    // Waiting for a hand wave
    vernie.on("distance", async (port, distance) => {

        if (running || distance > 100) {
            return;
        }

        running = true;

        await vernie.sleep(500);

        // Shake head
        await vernie.setMotorAngle("D", 40, 20);
        await vernie.setMotorAngle("D", 80, -20);
        await vernie.setMotorAngle("D", 40, 20);

        await vernie.sleep(500);

        // Turn right
        await vernie.wait([
            vernie.setMotorAngle("A", 50, 10),
            vernie.setMotorAngle("B", 50, -10)
        ]);

        // Shake head
        await vernie.setMotorAngle("D", 40, 20);

        await vernie.sleep(500);

        // Turn left
        await vernie.wait([
            vernie.setMotorAngle("A", 100, -10),
            vernie.setMotorAngle("B", 100, 10)
        ]);

        // Shake head
        await vernie.setMotorAngle("D", 80, -20);

        await vernie.sleep(500);

        // Turn right
        await vernie.wait([
            vernie.setMotorAngle("A", 50, 10),
            vernie.setMotorAngle("B", 50, -10)
        ]);

        // Shake head
        await vernie.setMotorAngle("D", 80, 20);
        await vernie.setMotorAngle("D", 40, -20);

        await vernie.sleep(500);

        // Move forward
        await vernie.setMotorAngle("AB", 200, 10);

        // FIRE!
        await vernie.setMotorAngle("D", 80, 20);
        await vernie.setMotorAngle("D", 80, -20);

        // Move back
        await vernie.setMotorAngle("AB", 200, -10);

        running = false;

    });

});