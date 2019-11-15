/*
 *
 * This example allows Vernie to roam a room and avoid obstacles.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan(); // Start scanning

console.log("Looking for Vernie...");

const Modes = {
    ROAMING: 0,
    AVOIDING: 1,
    STALLED: 2,
    CHANGING_DIRECTION: 3
}


const turnRight = async (vernie, multiplier = 1) => {
    await vernie.wait([
        vernie.setMotorAngle("A", 270 * multiplier, 50),
        vernie.setMotorAngle("B", 270 * multiplier, -50)
    ]);
}


const turnHeadRight = async (vernie, multiplier = 1) => {
    await vernie.setMotorAngle("D", 25 * multiplier, 20);
}


const turnLeft = async (vernie, multiplier = 1) => {
    await vernie.wait([
        vernie.setMotorAngle("A", 270 * multiplier, -50),
        vernie.setMotorAngle("B", 270 * multiplier, 50)
    ]);
}


const turnHeadLeft = async (vernie, multiplier = 1) => {
    await vernie.setMotorAngle("D", 25 * multiplier, -20);
}


const scan = (vernie) => {
    return new Promise(async (resolve) => {
        let lastDistance = 0;
        vernie.on("distance", async (port, distance) => {
            lastDistance = distance;
        });
        await turnHeadRight(vernie);
        await turnRight(vernie);
        await turnHeadLeft(vernie);
        await vernie.sleep(1000);
        const rightDistance = lastDistance;
        await turnHeadLeft(vernie);
        await turnLeft(vernie, 2);
        await turnHeadRight(vernie);
        await vernie.sleep(1000);
        const leftDistance = lastDistance;
        await turnHeadRight(vernie);
        await turnRight(vernie);
        await turnHeadLeft(vernie);
        await vernie.sleep(1000);
        const forwardDistance = lastDistance;
        return resolve({ leftDistance, forwardDistance, rightDistance });
    });
}


poweredUP.on("discover", async (vernie) => { // Wait to discover Vernie

    if (vernie instanceof PoweredUP.BoostMoveHub) {

        let mode = Modes.ROAMING;

        await vernie.connect();
        console.log("Connected to Vernie!");
        vernie.setLEDColor(PoweredUP.Consts.Color.BLUE);
        await vernie.sleep(1000);
        vernie.setMotorSpeed("AB", 50); // Start moving!

        vernie.on("distance", async (port, distance) => {
            if (distance < 150 && mode === Modes.ROAMING) { // If we're roaming around and we detect an object in front of us, stop and scan

                mode = Modes.AVOIDING;
                vernie.setMotorSpeed("AB", 0);
                await vernie.sleep(1000);

                const { leftDistance, forwardDistance, rightDistance } = await scan(vernie);

                if (rightDistance >= forwardDistance && rightDistance >= leftDistance && rightDistance > 200) {
                    // Go right
                    await turnHeadRight(vernie);
                    await turnRight(vernie);
                    await turnHeadLeft(vernie);
                    await vernie.sleep(1000);
                    await vernie.setMotorSpeed("AB", 50);
                } else if (leftDistance >= forwardDistance && leftDistance >= rightDistance && leftDistance > 200) {
                    // Go left
                    await turnHeadLeft(vernie);
                    await turnLeft(vernie);
                    await turnHeadRight(vernie);
                    await vernie.sleep(1000);
                    await vernie.setMotorSpeed("AB", 50);
                } else {
                    // Turn around
                    await turnHeadRight(vernie);
                    await turnRight(vernie, 2);
                    await turnHeadLeft(vernie);
                    await vernie.sleep(1000);
                    await vernie.setMotorSpeed("AB", 50);
                }

                mode = Modes.ROAMING;

            }
        });

        setInterval(async () => {
            if (vernie.current > 20 && mode === Modes.ROAMING) { // If current spikes, we've likely stalled on something. Reverse and scan.
                
                mode = Modes.AVOIDING;
                await vernie.sleep(1000);
                await vernie.setMotorSpeed("AB", -30, 1500); // Reverse
                await vernie.sleep(1000);
                
                const { leftDistance, forwardDistance, rightDistance } = await scan(vernie);

                if (rightDistance >= forwardDistance && rightDistance >= leftDistance && rightDistance > 200) {
                    // Go right
                    await turnHeadRight(vernie);
                    await turnRight(vernie);
                    await turnHeadLeft(vernie);
                    await vernie.sleep(1000);
                    await vernie.setMotorSpeed("AB", 50);
                } else if (leftDistance >= forwardDistance && leftDistance >= rightDistance && leftDistance > 200) {
                    // Go left
                    await turnHeadLeft(vernie);
                    await turnLeft(vernie);
                    await turnHeadRight(vernie);
                    await vernie.sleep(1000);
                    await vernie.setMotorSpeed("AB", 50);
                } else {
                    // Turn around
                    await turnHeadRight(vernie);
                    await turnRight(vernie, 2);
                    await turnHeadLeft(vernie);
                    await vernie.sleep(1000);
                    await vernie.setMotorSpeed("AB", 50);
                }

                mode = Modes.ROAMING;

            }
        }, 2000);

    }
    
});