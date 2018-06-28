const LPF2 = require(".").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

let train = null;
let left = null;
let right = null;

const trainUUID = "";
const leftUUID = "";
const rightUUID = "";

let ignoreColor = false;
let leftSwitchState = false;

lpf2.on("discover", async (hub) => {

    if (hub.uuid === trainUUID) {
        train = hub;
        await train.connect();
        console.log("Train connected!");

        train.on("color", (port, color) => {
            if (color === LPF2.Consts.Colors.RED && !ignoreColor) {
                train.setMotorSpeed("A", 30);
                ignoreColor = true;
                if (left) {
                    if (leftSwitchState) {
                        leftSwitchState = !leftSwitchState;
                        left.setMotorSpeed("A", 30);
                    } else {
                        leftSwitchState = !leftSwitchState;
                        left.setMotorSpeed("A", -30);
                    }
                }
                setTimeout(() => {
                    left.setMotorSpeed("A", 0);
                }, 500);
                setTimeout(() => {
                    ignoreColor = false;
                }, 2000);
            } else if (color === LPF2.Consts.Colors.BLUE && !ignoreColor) {
                train.setMotorSpeed("A", -30);
                ignoreColor = true;
                setTimeout(() => {
                    ignoreColor = false;
                }, 2000);
            }
        });

        train.setMotorSpeed("A", 30);

    } else if (hub.uuid === leftUUID) {
        left = hub;
        await left.connect();
        console.log("Left Switch connected!");
    } else if (hub.uuid === rightUUID) {
        right = hub;
        await right.connect();
        console.log("Right Switch connected!");
    } else {
        return;
    }

});

let color = 0;
setInterval(() => {

    const hubs = lpf2.getConnectedDevices();
    hubs.forEach((hub) => {
        hub.setLEDColor(color);
    })
    color++;
    if (color > 10) {
        color = 0;
    }

}, 2000);