/*
 *
 * This runs the train under our Christmas tree. It uses the 10254 Winter Holiday Train retrofitted with a Powered UP hub and train motor.
 * It also uses a WeDo 2.0 hub with Powered UP distance sensor to detect the train approaching the station and slow it down.
 * 
 * Note that if you want to use this yourself you don't need to use a WeDo 2.0 hub, you can use any hub that can accept a distance or color/distance sensor.
 * 
 * The maximum speed of the train is set to a constant 50. A further improvement can be made by scaling the speed up according to the current battery voltage,
 * so the speed doesn't slow as the battery starts dying.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

let train = null;
let sensor = null;

let ramping = false;

poweredUP.on("discover", async (hub) => { // Wait to discover hubs

    if (hub.name === "NK_Winter_Train") {
        await hub.connect(); // Connect to hub
        console.log(`Connected to train!`);
        train = hub;
    } else if (hub.name === "NK_Winter_Sensor") {
        await hub.connect(); // Connect to hub
        console.log(`Connected to sensor!`);
        sensor = hub;

        sensor.on("distance", (_, distance) => {
            if (distance < 5 && !ramping) {
                await stopTrain();
            }
        });

    }

    if (train && sensor) {
        console.log("Train and sensor connected, starting!");
        await startTrain();
    }

});

const startTrain =  async () => {
    ramping = true;
    await train.rampMotorSpeed("A", 0, 50, 2000);
    ramping = false;
}

const stopTrain = async () => {
    ramping = true;
    await train.rampMotorSpeed("A", 50, 0, 2000);
}