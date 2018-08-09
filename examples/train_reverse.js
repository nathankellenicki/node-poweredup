const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning for trains

// Change these to make the train behave as you want
const FORWARD_DIRECTION_COLOR = PoweredUP.Consts.Colors.YELLOW;
const BACKWARDS_DIRECTION_COLOR = PoweredUP.Consts.Colors.RED;
const TRAIN_SPEED = 40;
const STOPPING_SPEED = 2000;
const STOP_DELAY = 2000;
const TRAIN_MOTOR_PORT = "A";

let currentSpeed = 0;

console.log("Looking for trains...");

poweredUP.on("discover", async (hub) => { // Wait to discover a train

    let moving = true;

    await hub.connect(); // Connect to train
    console.log(`Connected to ${hub.name}!`);

    await hub.sleep(2000); // Wait two seconds before starting the train
    hub.setMotorSpeed(TRAIN_MOTOR_PORT, TRAIN_SPEED);
    currentSpeed = TRAIN_SPEED;
    console.log("Started moving");

    hub.on("color", async (port, color) => {

        if (color === FORWARD_DIRECTION_COLOR && moving) { // If yellow is seen, stop the train, wait seconds, and reverse direction

            console.log("Slowing down");
            moving = false;
            await hub.rampMotorSpeed(TRAIN_MOTOR_PORT, currentSpeed, 0, STOPPING_SPEED);
            currentSpeed = 0;
            console.log("Stopped");
            await hub.sleep(STOP_DELAY);
            console.log("Changing direction and speeding up");
            await hub.rampMotorSpeed(TRAIN_MOTOR_PORT, currentSpeed + 10, TRAIN_SPEED, STOPPING_SPEED);
            currentSpeed = TRAIN_SPEED;
            await hub.sleep(STOPPING_SPEED + 1000);
            moving = true;

        } else if (color === BACKWARDS_DIRECTION_COLOR && moving) { // If red is seen, stop the train, wait seconds, and reverse direction

            console.log("Slowing down");
            moving = false;
            await hub.rampMotorSpeed(TRAIN_MOTOR_PORT, currentSpeed, 0, STOPPING_SPEED);
            currentSpeed = 0;
            console.log("Stopped");
            await hub.sleep(STOP_DELAY);
            console.log("Changing direction and speeding up");
            await hub.rampMotorSpeed(TRAIN_MOTOR_PORT, -(currentSpeed + 10), -TRAIN_SPEED, STOPPING_SPEED);
            currentSpeed = -TRAIN_SPEED;
            await hub.sleep(STOPPING_SPEED + 1000);
            moving = true;

        }

    });

});