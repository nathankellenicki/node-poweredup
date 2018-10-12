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
        vernie.setMotorAngle("A", 300 * multiplier, 50),
        vernie.setMotorAngle("B", 300 * multiplier, -50)
    ]);
}


const turnHeadRight = async (vernie, multiplier = 1) => {
    await vernie.setMotorAngle("D", 35 * 1, 20);
}


const turnLeft = async (vernie, multiplier = 1) => {
    await vernie.wait([
        vernie.setMotorAngle("A", 300 * multiplier, -50),
        vernie.setMotorAngle("B", 300 * multiplier, 50)
    ]);
}


const turnHeadLeft = async (vernie, multiplier = 1) => {
    await vernie.setMotorAngle("D", 35 * 1, -20);
}


const scan = (vernie) => {
    return new Promise(async (resolve) => {
        let lastDistance = 0;
        vernie.on("distance", async (port, distance) => {
            lastDistance = distance;
        });
        await vernie.wait([
            turnRight(vernie),
            turnHeadRight(vernie)
        ]);
        await vernie.sleep(1000);
        const rightDistance = lastDistance;
        await vernie.wait([
            turnLeft(vernie, 2),
            turnHeadLeft(vernie, 2)
        ]);
        await vernie.sleep(1000);
        const leftDistance = lastDistance;
        await vernie.wait([
            turnRight(vernie),
            turnHeadRight(vernie)
        ]);
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
        vernie.setLEDColor(PoweredUP.Consts.Colors.BLUE);
        await vernie.sleep(1000);
        vernie.setMotorSpeed("AB", 50); // Start moving!

        vernie.on("distance", async (port, distance) => {
            if (distance < 150 && mode === Modes.ROAMING) { // If we're roaming around and we detect an object in front of us, stop and scan

                mode = Modes.AVOIDING;
                vernie.setMotorSpeed("AB", 0);
                await vernie.sleep(1000);

                const { leftDistance, forwardDistance, rightDistance } = await scan(vernie);

                if (rightDistance >= forwardDistance && rightDistance >= leftDistance) {
                    // Go right
                    await vernie.wait([
                        turnRight(vernie),
                        turnHeadRight(vernie)
                    ]);
                    await vernie.sleep(1000);
                    await vernie.wait([
                        vernie.setMotorSpeed("AB", 50),
                        turnHeadLeft(vernie)
                    ]);
                } else if (leftDistance >= forwardDistance && leftDistance >= rightDistance) {
                    // Go left
                    await vernie.wait([
                        turnLeft(vernie),
                        turnHeadLeft(vernie)
                    ]);
                    await vernie.sleep(1000);
                    await vernie.wait([
                        vernie.setMotorSpeed("AB", 50),
                        turnHeadRight(vernie)
                    ]);
                } else {
                    // Go forward
                    vernie.setMotorSpeed("AB", 50);
                }

                mode = Modes.ROAMING;

            }
        });

    }
    
});