const LPF2 = require("./lpf2.js");

const lpf2 = new LPF2();

lpf2.scan();

let moveHub = null,
    moveHubUUID = "782a5fbbcef64c5cb31ab4791c191f5d";
    wedoHub = null,
    wedoHubUUID = "0ae95acf801e47f9bda4752392756eed";

lpf2.on("discover", (hub) => {
    hub.connect(() => {
        
        if (hub.uuid === moveHubUUID) {
            moveHub = hub;
            console.log("Connected to Move Hub");

            moveHub.on("distance", (port, distance) => {
                console.log(`Distance ${distance} received on port ${port}`);
                if (distance < 100) {
                    moveHub.setMotorSpeed("D", 40);
                } else {
                    moveHub.setMotorSpeed("D", 0);
                }
            });

        } else if (hub.uuid === wedoHubUUID) {
            wedoHub = hub;
            console.log("Connected to Smart Hub");

            wedoHub.on("distance", (port, distance) => {
                console.log(`Distance ${distance} received on port ${port}`);
                if (distance < 100) {
                    wedoHub.setMotorSpeed("B", 40);
                } else {
                    wedoHub.setMotorSpeed("B", 0);
                }
            });

        }

    });

});


let color = 0;

setInterval(() => {

    color = color > 10 ? 1 : color + 1;
    if (moveHub) moveHub.setLEDColor(color);
    if (wedoHub) wedoHub.setLEDColor(color);

}, 2000);