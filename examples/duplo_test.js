const PoweredUP = require("..");
const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);
    await hub.connect(); // Connect to the Hub
    console.log("Connected");
    let devices = hub.getDevices()
    console.log(`Devices ${devices}`);
    for (let i = 0; i<devices.length; ++i){
        let device = devices[i];
        console.log(`Device port ${device.portName} type ${device.type}`);
    }

    const motor = await hub.waitForDeviceAtPort("MOTOR");

    while (true) { // Repeat indefinitely
        console.log("Running motor at speed 100 for 2 seconds");
        motor.setPower(100); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        await hub.sleep(2000);
        console.log("Running motor at revrese speed 100 for 2 seconds");
        motor.setPower(-100); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        await hub.sleep(2000);
        motor.brake();
    }
});

poweredUP.scan(); // Start scanning for Hubs
console.log("Scanning for Hubs...");
