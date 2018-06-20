const LPF2 = require("./dist/lpf2.js");

const lpf2 = new LPF2.LPF2();

//lpf2.autoSubscribe = false;
lpf2.scan();

let moveHub = null,
    moveHubUUID = "e6e40e4f00e34dbe955da2b187adcd2f",
    moveHub2 = null,
    moveHub2UUID = "c72413db7ce24411967ff25184d4609a",
    wedoHub = null,
    wedoHubUUID = "f4924139c6684be19840f97738c707f3";

lpf2.on("discover", (hub) => {

    hub.connect(() => {
        
    //console.log(hub.uuid);

        if (hub.uuid === moveHubUUID) {
            moveHub = hub;
            console.log("Connected to Move Hub");

            moveHub.on("distance", (port, distance) => {
                //console.log(`Distance ${distance} received on port ${port}`);
                if (distance < 90) {
                    if (wedoHub) wedoHub.setMotorSpeed("B", 40);
                    if (moveHub2) moveHub2.setMotorSpeed("D", 40);
                } else {
                    if (wedoHub) wedoHub.setMotorSpeed("B", 0);
                    if (moveHub2) moveHub2.setMotorSpeed("D", 0);
                }
            });

        } else if (hub.uuid === moveHub2UUID) {
            moveHub2 = hub;
            console.log("Connected to Move Hub 2");

            moveHub2.on("distance", (port, distance) => {
                //console.log(`Distance ${distance} received on port ${port}`);
                if (distance < 90) {
                    if (wedoHub) wedoHub.setMotorSpeed("B", 40);
                    if (moveHub) moveHub.setMotorSpeed("D", 40);
                } else {
                    if (wedoHub) wedoHub.setMotorSpeed("B", 0);
                    if (moveHub) moveHub.setMotorSpeed("D", 0);
                }
            });

        } else if (hub.uuid === wedoHubUUID) {
            wedoHub = hub;
            console.log("Connected to Smart Hub");

            wedoHub.on("distance", (port, distance) => {
                //console.log(`Distance ${distance} received on port ${port}`);
                if (distance < 90) {
                    if (moveHub) moveHub.setMotorSpeed("D", 40);
                    if (moveHub2) moveHub2.setMotorSpeed("D", 40);
                } else {
                    if (moveHub) moveHub.setMotorSpeed("D", 0);
                    if (moveHub2) moveHub2.setMotorSpeed("D", 0);
                }
            });

        }

    });

});


let color = 0;

setInterval(() => {

    color = color > 10 ? 1 : color + 1;
    if (moveHub) moveHub.setLEDColor(color);
    if (moveHub2) moveHub2.setLEDColor(color);
    if (wedoHub) wedoHub.setLEDColor(color);

}, 2000);
