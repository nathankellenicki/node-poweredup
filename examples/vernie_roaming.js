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


const scan = (vernie) => {
    return new Promise(async (resolve) => {
        let lastDistance = 0;
        vernie.on("distance", async (port, distance) => {
            lastDistance = distance;
        });
        await vernie.wait([
            vernie.setMotorAngle("A", 300, 50),
            vernie.setMotorAngle("B", 300, -50),
            vernie.setMotorAngle("D", 35, 20)
        ]);
        await vernie.sleep(1000);
        const rightDistance = lastDistance;
        await vernie.wait([
            vernie.setMotorAngle("A", 600, -50),
            vernie.setMotorAngle("B", 600, 50),
            vernie.setMotorAngle("D", 70, -20)
        ]);
        await vernie.sleep(1000);
        const leftDistance = lastDistance;
        await vernie.wait([
            vernie.setMotorAngle("A", 300, 50),
            vernie.setMotorAngle("B", 300, -50),
            vernie.setMotorAngle("D", 35, 20)
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
        vernie.setMotorSpeed("AB", 50); // Start moving!

        await vernie.sleep(1000);

        vernie.on("distance", async (port, distance) => {
            if (distance < 150 && mode === Modes.ROAMING) { // If we're roaming around and we detect an object in front of us, stop and scan

                mode = Modes.AVOIDING;
                vernie.setMotorSpeed("AB", 0);
                await vernie.sleep(1000);

                const { leftDistance, forwardDistance, rightDistance } = await scan(vernie);
                console.log(leftDistance, forwardDistance, rightDistance);

                if (rightDistance >= forwardDistance && rightDistance >= leftDistance) {
                    // Go right
                    await vernie.wait([
                        vernie.setMotorAngle("A", 300, 50),
                        vernie.setMotorAngle("B", 300, -50),
                        vernie.setMotorAngle("D", 35, 20)
                    ]);
                    await vernie.sleep(1000);
                    await vernie.wait([
                        vernie.setMotorSpeed("AB", 50),
                        vernie.setMotorAngle("D", 35, -20)
                    ]);
                } else if (leftDistance >= forwardDistance && leftDistance >= rightDistance) {
                    // Go left
                    await vernie.wait([
                        vernie.setMotorAngle("A", 300, -50),
                        vernie.setMotorAngle("B", 300, 50),
                        vernie.setMotorAngle("D", 35, -20)
                    ]);
                    await vernie.sleep(1000);
                    await vernie.wait([
                        vernie.setMotorSpeed("AB", 50),
                        vernie.setMotorAngle("D", 35, 20)
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