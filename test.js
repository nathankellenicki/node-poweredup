const LPF2 = require("./lpf2.js");

const lpf2 = new LPF2();

lpf2.scan();

lpf2.on("discover", (hub) => {
    hub.connect();
    hub.on("distance", (port, distance) => {
        console.log(`Distance ${distance} received on port ${port}`);
    });
    hub.on("color", (port, color) => {
        console.log(`Color ${color} received on port ${port}`);
    });
    hub.on("tilt", (port, x, y) => {
        console.log(`Tilt ${x}, ${y} received on port ${port}`);
    });
    hub.on("rotate", (port, rotate) => {
        console.log(`Rotate ${rotate} received on port ${port}`);
    });
    // setTimeout(() => {
    //      hub.setMotorSpeed("C", 30);
    //         setTimeout(() => {
    //             hub.setMotorSpeed("C", 0);
    //         }, 3000);
    // }, 3000);
});