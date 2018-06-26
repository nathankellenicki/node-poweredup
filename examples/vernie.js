const LPF2 = require("..").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for Vernie

console.log("Looking for Vernie (Please turn on the Hub now)...");

lpf2.on("discover", async (vernie) => { // Wait to discover Vernie

    lpf2.stop(); // Stop scanning for Vernie (We've just found him!)
    await vernie.connect(); // Connect to Vernie

    console.log("Connected to Vernie!");
    
    await vernie.sleep(500);

    // Shake head
    await vernie.setMotorAngle("D", 40, 30);
    await vernie.setMotorAngle("D", 80, -30);
    await vernie.setMotorAngle("D", 40, 30);

    await vernie.sleep(500);

    // Turn right
    vernie.wait([
        vernie.setMotorAngle("A", 50, 50),
        vernie.setMotorAngle("B", 50, -50)
    ]);

    // Shake head
    await vernie.setMotorAngle("D", 40, 30);

    await vernie.sleep(500);

    // Turn left
    vernie.wait([
        vernie.setMotorAngle("A", 100, -50),
        vernie.setMotorAngle("B", 100, 50)
    ]);

    // Shake head
    await vernie.setMotorAngle("D", 80, -30);

    await vernie.sleep(500);

    // Turn right
    vernie.wait([
        vernie.setMotorAngle("A", 50, 50),
        vernie.setMotorAngle("B", 50, -50)
    ]);

    // Shake head
    await vernie.setMotorAngle("D", 80, 30);
    await vernie.setMotorAngle("D", 40, -30);

    await vernie.sleep(500);

    // Move forward
    await vernie.setMotorAngle("AB", 100, 30);

    // FIRE!
    await vernie.setMotorAngle("D", 90, 30);
    await vernie.setMotorAngle("D", 90, -30);

    // Move back
    await vernie.setMotorAngle("AB", 100, -30);

});