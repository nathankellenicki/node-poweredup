const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP()

const trains = [
    {
        name: "Maersk Intermodal",
        color: PoweredUP.Consts.Color.LIGHT_BLUE,
        hubs: [
            {
                name: "NK_Maersk",
                ports: ["A"]
            }
        ]
    },
    {
        name: "Horizon Express",
        color: PoweredUP.Consts.Color.ORANGE,
        hubs: [
            {
                name: "NK_Horizon_1",
                ports: ["A"],
                lights: ["B"],
                reverse: ["A"]
            },
            {
                name: "NK_Horizon_2",
                ports: ["A"],
                lights: ["B"]
            }
        ]
    },
    {
        name: "Emerald Night",
        color: PoweredUP.Consts.Color.GREEN,
        hubs: [
            {
                name: "NK_Emerald",
                ports: ["A"],
                lights: ["B"],
                reverse: ["A"]
            }
        ]
    },
    {
        name: "Metroliner",
        color: PoweredUP.Consts.Color.WHITE,
        hubs: [
            {
                name: "NK_Metroliner",
                ports: ["A"],
                lights: ["B"],
                reverse: ["A"]
            }
        ]
    }
];


poweredUP.on("discover", async (hub) => {

    if (hub instanceof PoweredUP.PUPRemote) {
        hub.on("button", (button, state) => {

            if (button === "GREEN") {
                if (state === PoweredUP.Consts.ButtonState.PRESSED) {
                    hub._currentTrain++;
                    if (hub._currentTrain >= trains.length) {
                        hub._currentTrain = 0;
                    }
                    hub.setLEDColor(trains[hub._currentTrain].color);
                    const batteryLevels = [];
                    const train = trains[hub._currentTrain];
                    for (let trainHub of train.hubs) {
                        if (trainHub._hub) {
                            batteryLevels.push(`${trainHub.name}: ${trainHub._hub.batteryLevel}%`);
                        }
                    }
                    console.log(`Switched active train on remote ${hub.name} to ${trains[hub._currentTrain].name} (${batteryLevels.join(", ")})`);
                }
            } else if ((button === "LEFT" || button === "RIGHT") && state !== PoweredUP.Consts.ButtonState.RELEASED) {
                trains[hub._currentTrain]._speed = trains[hub._currentTrain]._speed || 0;
                if (state === PoweredUP.Consts.ButtonState.UP) {
                    trains[hub._currentTrain]._speed += 10;
                    if (trains[hub._currentTrain]._speed > 100) {
                        trains[hub._currentTrain]._speed = 100;
                    }
                } else if (state === PoweredUP.Consts.ButtonState.DOWN) {
                    trains[hub._currentTrain]._speed -= 10;
                    if (trains[hub._currentTrain]._speed < -100) {
                        trains[hub._currentTrain]._speed = -100;
                    }
                } else if (state === PoweredUP.Consts.ButtonState.STOP) {
                    trains[hub._currentTrain]._speed = 0;
                }
                for (let trainHub in trains[hub._currentTrain].hubs) {
                    trainHub = trains[hub._currentTrain].hubs[trainHub];
                    if (trainHub._hub) {
                        for (let port in trainHub.ports) {
                            port = trainHub.ports[port];
                            trainHub.reverse = trainHub.reverse || [];
                            trainHub._hub.setMotorSpeed(port, trainHub.reverse.indexOf(port) >= 0 ? -trains[hub._currentTrain]._speed : trains[hub._currentTrain]._speed);
                        }
                    }
                }
                console.log(`Set ${trains[hub._currentTrain].name} speed to ${trains[hub._currentTrain]._speed}`);
            }

        });
        await hub.connect();
        hub._currentTrain = 2;
        hub.setLEDColor(trains[hub._currentTrain].color);
        console.log(`Connected to Powered UP remote (${hub.name})`);
        return;
    }

    for (let train in trains) {
        train = trains[train];
        for (let trainHub in train.hubs) {
            trainHub = train.hubs[trainHub];
            if (hub.name === trainHub.name) {
                hub.on("attach", (port, type) => {
                    if (trainHub.lights && trainHub.lights.indexOf(port) >= 0) {
                        hub.setLightBrightness(port, 100);
                    }
                });
                hub.on("disconnect", () => {
                    console.log(`Disconnected from ${train.name} (${hub.name})`);
                    delete trainHub._hub;
                })
                await hub.connect();
                trainHub._hub = hub;
                hub.setLEDColor(train.color);
                console.log(`Connected to ${train.name} (${hub.name})`);
            }
        }
    }

});


poweredUP.scan(); // Start scanning for trains
console.log("Looking for trains...");
