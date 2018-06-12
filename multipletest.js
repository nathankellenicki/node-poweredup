const LPF2 = require("./lpf2.js");

const lpf2 = new LPF2();

let wedoUUID = "0ae95acf801e47f9bda4752392756eed",
    wedoHub = null,
    boostUUID = "782a5fbbcef64c5cb31ab4791c191f5d",
    boostHub = null;

lpf2.scan();

lpf2.on("discover", (hub) => {

    if (hub.uuid === wedoUUID) {
        wedoHub = hub;
        wedoHub.connect();
        wedoHub.on("distance", (port, distance) => {
            console.log(`Distance ${distance} received on WeDo port ${port}`);
            if (boostHub) {
                if (distance < 30) {
                    boostHub.setMotorSpeed("C", 40);
                } else {
                    boostHub.setMotorSpeed("C", 0);
                }
            }
        });
        return;
    }

    if (hub.uuid === boostUUID) {
        boostHub = hub;
        boostHub.connect();
        boostHub.on("distance", (port, distance) => {
            console.log(`Distance ${distance} received on Boost port ${port}`);
            if (wedoHub) {
                if (distance < 30) {
                    wedoHub.setMotorSpeed("B", 40);
                } else {
                    wedoHub.setMotorSpeed("B", 0);
                }
            }
        });
        return;
    }

});