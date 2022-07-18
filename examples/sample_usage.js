const PoweredUP = require("../src/index-node");
// import PoweredUP, { BaseHub } from "../src/index-node";

const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);

    if(!(hub instanceof PoweredUP.CircuitCube) ){
        return;
    }

    await hub.connect(); // Connect to the Hub
    // console.log('Connected to hub');
    // const motorA = await hub.waitForDeviceAtPort("A"); // Make sure a motor is plugged into port A
    // const motorB = await hub.waitForDeviceAtPort("B"); // Make sure a motor is plugged into port B
    console.log("Connected");
        await hub.sleep(2000); 

    // while (true) { // Repeat indefinitely
        // console.log('set name');
        // await hub.setName('Ben');
        // await hub.setName('Bendy678901234567890');
        // await hub.sleep(10000); 
        console.log('get name')
        await hub.getName();
        console.log('voltage', hub.batteryLevel)
        // await hub.getVoltage();
        // console.log("Running motor A at speed 50");
        console.log('setPower')
        await hub.setPower([250, undefined, -250])
        console.log('sleep')
        await hub.sleep(1000); 
        console.log('stopAll')
        await hub.stopAll();
        console.log('sleep')
        await hub.sleep(2000); 
        // console.log('get name')
        // await hub.getName();
        // console.log('sleep')
        // await hub.sleep(2000); 
        // process.exit();
        // await hub.setPower([250])
        // motorB.setPower(50); // Start a motor attached to port B to run a 3/4 speed (75) indefinitely
        // console.log("Running motor A at speed 100 for 2 seconds");
        // motorA.setPower(100); // Run a motor attached to port A for 2 seconds at maximum speed (100) then stop
        // await hub.sleep(2000);
        // motorA.brake();
        // await hub.sleep(1000); // Do nothing for 1 second
        // console.log("Running motor A at speed -30 for 1 second");
        // motorA.setPower(-30); // Run a motor attached to port A for 2 seconds at 1/2 speed in reverse (-50) then stop
        // await hub.sleep(2000);
        // motorA.brake();
    //     await hub.sleep(1000); // Do nothing for 1 second
    // }
});

poweredUP.scan(); // Start scanning for Hubs
console.log("Scanning for Hubs...");
