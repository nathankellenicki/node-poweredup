/*
 *
 * This example demonstrates usage of various sensor events.
 *
 */

const PoweredUP = require("..");

const poweredUP = new PoweredUP.PoweredUP();
poweredUP.scan();

console.log("Looking for Powered UP Hubs...");

let vernie = null;
let remote = null;

poweredUP.on("discover", async (hub) => {

    await hub.connect();
    console.log(`Connected to ${hub.name}!`);

    hub.on("disconnect", () => {
        console.log(`Disconnected ${hub.name}`);
    })

    hub.on("tilt", (port, x, y, z) => {
        console.log(`Tilt detected on port ${port} (X: ${x}, Y: ${y}${z !== "undefined" ? `, Z: ${z}`: ""})`);
    });

    hub.on("accel", (port, x, y, z) => {
        console.log(`Accelerometer detected on port ${port} (X: ${x}, Y: ${y}, Z: ${z})`);
    });

    hub.on("distance", (port, distance) => {
        console.log(`Motion detected on port ${port} (Distance: ${distance})`);
    });

    hub.on("color", (port, color) => {
        console.log(`Color detected on port ${port} (Color: ${color})`);
    });

    hub.on("rotate", (port, rotation) => {
        console.log(`Rotation detected on port ${port} (Rotation: ${rotation})`);
    });

    hub.on("button", (button, state) => {
        console.log(`Button press detected (Button: ${button}, State: ${state})`);
    });

    hub.on("attach", (port, device) => {
       console.log(`Device attached to port ${port} (Device ID: ${device})`) ;
    });

    hub.on("detach", (port) => {
        console.log(`Device detached from port ${port}`) ;
    });

});