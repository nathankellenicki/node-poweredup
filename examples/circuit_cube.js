const PoweredUP = require("../src/index-node");

const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);

    if(!(hub instanceof PoweredUP.CircuitCube) ){
        return;
    }

    await hub.connect(); // Connect to the Hub
    console.log("Connected");

    await hub.setPower([250, undefined, -250])
    await hub.sleep(1000); 
    await hub.stopAll();
    await hub.sleep(1000); 
});

poweredUP.scan(); // Start scanning for Hubs
console.log("Scanning for Hubs...");
