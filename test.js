const LPF2 = require("./lpf2.js");

const lpf2 = new LPF2();

lpf2.scan();

lpf2.on("discover", (hub) => {
    hub.connect();
    /*hub.on("tilt", (port, x, y) => {
        hub.setMotorSpeed(0, y);
    });*/
    let speed = 0;
    // setInterval(() => {
    //     console.log(speed);
    //     hub.setMotorSpeed(0, speed);
    //     speed += 1;
    // }, 500);
});