const LPF2 = require("..").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for Vernie

console.log("Looking for Vernie (Please turn the Hub on now)...");

lpf2.on("discover", async (vernie) => { // Wait to discover Vernie

    lpf2.stop(); // Stop scanning for Vernie (We've already found him!)
    await vernie.connect(); // Connect to Vernie

    console.log("Connected to Vernie!");
    await vernie.wait(3000); // Wait for 2 seconds before starting

    console.log("We're going on an adventure!");
    await vernie.setMotorSpeed("AB", 50, 2000); // Move forward for 2 seconds
    await vernie.setMotorAngle("B", 360, 50); // Turn right
    await vernie.setMotorSpeed("AB", 50, 2000); // Move forward for 2 seconds
    await vernie.wait(1000); // Wait for 1 second

    console.log("Better go home now...");
    await vernie.setMotorAngle("A", 720, 50); // Turn around
    await vernie.setMotorSpeed("AB", 50, 2000);  // Move forward for 2 seconds
    await vernie.setMotorAngle("A", 360, 50); // Turn left
    await vernie.setMotorSpeed("AB", 50, 2000);  // Move forward for 2 seconds
    await vernie.setMotorAngle("A", 720, 50); // Turn around - Vernie should now be back in his original position!

});