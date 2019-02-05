const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning for trains

// Change these to make the train behave as you want
const STATION_STOP_COLOR = PoweredUP.Consts.Color.RED;
const TRAIN_SPEED = 55;
const STOPPING_SPEED = 4000;
const STOP_DELAY = 6000;
const LOOPS_WITHOUT_STOPPING = 3;
const TRAIN_MOTOR_PORT = "A";

let currentSpeed = 0;
let currentLoop = 0;

console.log("Looking for trains...");

poweredUP.on("discover", async (hub) => { // Wait to discover a train

    let sensing = true;

    await hub.connect(); // Connect to train
    console.log(`Connected to ${hub.name}!`);

    await hub.sleep(2000); // Wait two seconds before starting the train
    hub.setMotorSpeed(TRAIN_MOTOR_PORT, TRAIN_SPEED);
    currentSpeed = TRAIN_SPEED;
    console.log(`Started moving ${hub.name}`);

    hub.on("colorAndDistance", async (port, color, distance) => {
        if (color === STATION_STOP_COLOR && distance > 5 && distance < 15 && sensing) { // If color is seen, stop the train, wait, then go again
            if (currentLoop >= LOOPS_WITHOUT_STOPPING - 1) {

                console.log(`Looped ${hub.name} (${currentLoop + 1})`);
                console.log(`Stopping ${hub.name}`);
                sensing = false;
                await hub.rampMotorSpeed(TRAIN_MOTOR_PORT, currentSpeed, 0, STOPPING_SPEED);
                currentSpeed = 0;
                currentLoop = 0;
                console.log(`Stopped ${hub.name}`);
                await hub.sleep(STOP_DELAY);
                console.log(`Starting ${hub.name}`);
                await hub.rampMotorSpeed(TRAIN_MOTOR_PORT, currentSpeed + 10, TRAIN_SPEED, STOPPING_SPEED);
                currentSpeed = TRAIN_SPEED;
                await hub.sleep(2000);
                sensing = true;

            } else {
                console.log(`Looped ${hub.name} (${currentLoop + 1})`);
                sensing = false;
                currentLoop++;
                await hub.sleep(2000);
                sensing = true;
            }
        }
    });

});