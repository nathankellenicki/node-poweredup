/*
 *
 * This demonstrates connecting multiple hubs to your laptop. Once connected, all the hubs LED lights will cycle through the same colors simultaneously.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

poweredUP.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    console.log(`Connected to ${hub.name}!`);

    hub.on("attach", (device) => {

        if (device instanceof PoweredUP.ControlPlusLargeMotor) {
            const motor = device;
            motor.setSpeed(30);
        }

        if (device instanceof PoweredUP.ColorDistanceSensor) {
            const sensor = device;
            sensor.on("distance", (distance) => { // Adding an event handler for distance automatically subscribes to distance notifications
                console.log(`Distance ${distance}`);
            })
        }

        device.on("detach", () => {
            console.log(device.connected);
        })

    });

    hub.on("disconnect", () => {
        console.log("Hub disconnected");
    })

});