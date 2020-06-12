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

    hub.on("tilt", (device, { x, y, z }) => {
        console.log(`Tilt detected on port ${device.portName} (X: ${x}, Y: ${y}${z !== "undefined" ? `, Z: ${z}`: ""})`);
    });

    hub.on("accel", (device, { x, y, z }) => {
        console.log(`Accelerometer detected on port ${device.portName} (X: ${x}, Y: ${y}, Z: ${z})`);
    });

    hub.on("distance", (device, { distance }) => {
        console.log(`Motion detected on port ${device.portName} (Distance: ${distance})`);
    });

    hub.on("color", (device, { color }) => {
        console.log(`Color detected on port ${device.portName} (Color: ${color})`);
    });

    hub.on("rotate", (device, { degrees }) => {
        console.log(`Rotation detected on port ${device.portName} (Rotation: ${degrees})`);
    });

    hub.on("force", (device, { force }) => {
        console.log(`Force detected on port ${device.portName} (Force: ${force})`);
    });

    hub.on("button", ({ event }) => {
        console.log(`Green button press detected (Event: ${event})`);
    });

    hub.on("remoteButton", (device, { event }) => {
        console.log(`Remote control button press detected on port ${device.portName} (Event: ${event})`);
    });

    hub.on("attach", (device) => {
       console.log(`Device attached to port ${device.portName} (Device ID: ${device.type})`) ;
    });

    hub.on("detach", (device) => {
        console.log(`Device detached from port ${device.portName}`) ;
    });

});