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

        device.on("detach", () => {
            console.log(`Detached device ${device.type} from ${device.port}`);
        });

        if ((
            device instanceof PoweredUP.SimpleMediumLinearMotor ||
            device instanceof PoweredUP.TrainMotor ||
            device instanceof PoweredUP.MediumLinearMotor ||
            device instanceof PoweredUP.TechnicLargeLinearMotor ||
            device instanceof PoweredUP.TechnicXLargeLinearMotor
        ) && hub.type === PoweredUP.Consts.HubType.WEDO2_SMART_HUB) {
            const motor = device;

            motor.on("rotate", (angle) => {
                console.log(`Rotate ${angle}`);
            });

            motor.setPower(40);
            await hub.sleep(2000);
            motor.setPower(0);
            await hub.sleep(2000);
            motor.setPower(-40);
            await hub.sleep(2000);
            motor.setPower(0);
            await hub.sleep(2000);
            motor.setPower(20);

        }

        if ((
            // device instanceof PoweredUP.MoveHubMediumLinearMotor ||
            device instanceof PoweredUP.MediumLinearMotor ||
            device instanceof PoweredUP.TechnicLargeLinearMotor ||
            device instanceof PoweredUP.TechnicXLargeLinearMotor
        ) && hub.type !== PoweredUP.Consts.HubType.WEDO2_SMART_HUB) {
            const motor = device;

            motor.on("rotate", (angle) => {
                console.log(`Rotate ${angle}`);
            });

            await motor.rotateByAngle(900, 50);
            await motor.rotateByAngle(900, -50);
            await motor.rotateByAngle(900, 50);
            await motor.rotateByAngle(900, -50);
            motor.setPower(20);
        }

        if (
            device instanceof PoweredUP.SimpleMediumLinearMotor ||
            device instanceof PoweredUP.TrainMotor
        ) {
            const motor = device;

            motor.setPower(20);
            await hub.sleep(1000);
            motor.setPower(40);
            await hub.sleep(1000);
            motor.setPower(60);
            await hub.sleep(1000);
            motor.setPower(80);
            await hub.sleep(1000);
            motor.setPower(100);
            await hub.sleep(1000);
            motor.setPower(60);
            await hub.sleep(1000);
            motor.setPower(20);
        }

        if (
            device instanceof PoweredUP.Light
        ) {
            const lights = device;

            lights.setBrightness(100);
            await hub.sleep(1000);
            lights.setBrightness(0);
            await hub.sleep(1000);
            lights.setBrightness(100);
            await hub.sleep(1000);
            lights.setBrightness(0);
            await hub.sleep(1000);
            lights.setBrightness(100);
        }

        if (device instanceof PoweredUP.ColorDistanceSensor) {
            const sensor = device;
            sensor.on("distance", (distance) => {
                console.log(`Distance ${distance}`);
            });
            // sensor.on("color", (color) => {
            //     console.log(`Color ${color}`);
            // });
        }

        if (device instanceof PoweredUP.MotionSensor) {
            const sensor = device;
            sensor.on("distance", (distance) => {
                console.log(`Distance ${distance}`);
            });
        }

        if (device instanceof PoweredUP.TiltSensor) {
            const sensor = device;
            sensor.on("tilt", (x, y) => {
                console.log(`Tilt ${x} ${y}`);
            });
        }

    });

    hub.on("disconnect", () => {
        console.log("Hub disconnected");
    })

});