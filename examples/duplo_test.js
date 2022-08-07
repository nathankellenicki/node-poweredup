const PoweredUP = require("..");
const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);
    await hub.connect(); // Connect to the Hub
    console.log("Connected");
    let devices = hub.getDevices()
    for (let i = 0; i<devices.length; ++i){
        let device = devices[i];
        console.log(`Device port ${device.portName} type ${device.type}`);
    }
    const hubLed = PoweredUP.Consts.DeviceTypeNames.HUB_LED;
    let lights = hub.getDevicesByType(hubLed);
    for (let i = 0; i<lights.length; ++i){
        let device = lights[i];
        console.log(`HubLed port ${device.portName} type ${device.type}`);
    }

    const motor = await hub.waitForDeviceAtPort("MOTOR");
    const light = await hub.waitForDeviceByType(hubLed);
    console.log("Setting running light to RED for 2 seconds");
    light.setColor(PoweredUP.Consts.ColorNames.RED);
    await hub.sleep(2000);
    console.log("Setting running light to WHITE");    
    light.setColor(PoweredUP.Consts.ColorNames.WHITE);

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
