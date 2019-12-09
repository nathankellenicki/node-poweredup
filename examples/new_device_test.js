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

    hub.on("attach", async (device) => {

        console.log(`Attached device ${device.type} to ${device.port}`)

        if (device instanceof PoweredUP.ControlPlusLargeMotor) {
            const motor = device;

            motor.on("rotate", (angle) => {
                console.log(`Rotate ${angle}`);
            });

            await motor.rotateByAngle(9000, 50);
            await motor.rotateByAngle(9000, -50);
            await motor.rotateByAngle(9000, 50);
            await motor.rotateByAngle(9000, -50);
            motor.power(100);
        }

        if (device instanceof PoweredUP.ColorDistanceSensor) {
            const sensor = device;
            sensor.on("distance", (distance) => { // Adding an event handler for distance automatically subscribes to distance notifications
                console.log(`Distance ${distance}`);
            });
            sensor.on("color", (color) => {
                console.log(`Color ${color}`);
            });
        }

        device.on("detach", () => {
            console.log(`Detached device ${device.type} from ${device.port}`)
        })

    });

    hub.on("disconnect", () => {
        console.log("Hub disconnected");
    })

});