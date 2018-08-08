const PoweredUP = require("..");
const poweredUP = new PoweredUP.PoweredUP();

const trains = [
    {
        name: "Maersk Intermodal",
        color: PoweredUP.Consts.Colors.LIGHT_BLUE,
        hubs: [
            {
                name: "NK_Maersk",
                ports: ["A"]
            }
        ]
    },
    {
        name: "Horizon Express",
        color: PoweredUP.Consts.Colors.ORANGE,
        hubs: [
            {
                name: "NK_Horizon_1",
                ports: ["A"],
                lights: ["B"]
            },
            {
                name: "NK_Horizon_2",
                ports: ["A"],
                reverse: ["A"]
            }
        ]
    },
    {
        name: "Emerald Night",
        color: PoweredUP.Consts.Colors.GREEN,
        hubs: [
            {
                name: "NK_Emerald",
                ports: ["A"],
                lights: ["B"]
            }
        ]
    },
    {
        name: "Metroliner",
        color: PoweredUP.Consts.Colors.WHITE,
        hubs: [
            {
                name: "NK_Metroliner",
                ports: ["A"],
                lights: ["B"]
            }
        ]
    }
];


let currentTrain = 0;
poweredUP.on("discover", async (hub) => {

    if (hub instanceof PoweredUP.PUPRemote) {
        hub.on("button", (button, state) => {

            switch (button) {
                case "GREEN": {
                    if (state === PoweredUP.Consts.ButtonStates.PRESSED) {
                        currentTrain++;
                        if (currentTrain >= trains.length) {
                            currentTrain = 0;
                        }
                        hub.setLEDColor(trains[currentTrain].color);
                        console.log(`Switched active train to ${trains[currentTrain].name}`);
                    }
                    break;
                }
                case "LEFT": {
                    trains[currentTrain]._speed = trains[currentTrain]._speed || 0;
                    if (state === PoweredUP.Consts.ButtonStates.UP) {
                        trains[currentTrain]._speed += 10;
                        if (trains[currentTrain]._speed > 100) {
                            trains[currentTrain]._speed = 100;
                        }
                    } else if (state === PoweredUP.Consts.ButtonStates.DOWN) {
                        trains[currentTrain]._speed -= 10;
                        if (trains[currentTrain]._speed < 0) {
                            trains[currentTrain]._speed = 0;
                        }
                    }
                    for (let trainHub in trains[currentTrain].hubs) {
                        if (trainHub._hub) {
                            for (let port in trainHub.ports) {
                                trainHub.reverse = trainHub.reverse || [];
                                trainHub._hub.setMotorSpeed(port, trainHub.reverse.indexOf(port) >= 0 ? -trains[currentTrain].speed : trains[currentTrain].speed);
                            }
                        }
                    }
                    console.log(`Set ${trains[currentTrain].name} speed to ${trains[currentTrain]._speed}`);
                }
            }

        });
        hub.setLEDColor(trains[currentTrain].color);
        return;
    }

    for (let train in trains) {
        for (let trainHub in train.hubs) {
            if (hub.name === trainHub.name) {
                trainHub._hub = hub;
                hub.setLEDColor(train.color);
                console.log(`Connected to ${train.name} (${hub.name})`);
                hub.on("disconnect", () => {
                    console.log(`Disconnected from ${train.name} (${hub.name})`);
                    delete trainHub._hub;
                })
            }
        }
    }

});


poweredUP.scan(); // Start scanning for trains
console.log("Looking for trains...");