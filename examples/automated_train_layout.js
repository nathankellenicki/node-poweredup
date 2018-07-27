// This example won't work by itself, this is the code used to automate this train layout: https://www.youtube.com/watch?v=Tyzo_hHFiUc
// It is included here as an example.

const LPF2 = require(".").LPF2;

const lpf2 = new LPF2();
lpf2.scan(); // Start scanning for hubs

console.log("Looking for Hubs...");

const maerskUuid = "e29b56ad7c74419a9c6462f13c58306c";
const horizonUuid = "2278310c5d3b47c087290d9dc745c017";
const outerUuid = "c72413db7ce24411967ff25184d4609a";
const innerUuid = "31c8ce1864f245d3ba5f87b33adb4b6d";
const stopUuid = "f4924139c6684be19840f97738c707f3";

let maersk = null;
let outer = null;
let inner = null;
let horizon = null;
let stop = null;

let state = 0;

let moving = true;

lpf2.on("discover", async (hub) => { // Wait to discover hubs

    console.log(hub.uuid);

    if (hub.uuid === outerUuid) {
        await hub.connect();
        outer = hub;
    }

    if (hub.uuid === innerUuid) {
        await hub.connect();
        inner = hub;
    }

    if (hub.uuid === horizonUuid) {
        await hub.connect();
        horizon = hub;
    }

    if (hub.uuid === stopUuid) {
        await hub.connect();
        stop = hub;

        stop.on("distance", async (port, distance) => {
            if (distance < 100 && moving && state === 10) {
                moving = false;
                horizon.setMotorSpeed("A", 0);
                await maersk.sleep(2000);
                maersk.setMotorSpeed("A", -40);
                setTimeout(() => {
                    state = 3;
                    moving = true;
                }, 3000);
            }
            if (distance < 100 && moving && state === 11) {
                moving = false;
                horizon.setMotorSpeed("A", 0);
                await maersk.sleep(2000);
                maersk.setMotorSpeed("A", 50);
                setTimeout(() => {
                    state = 0;
                    moving = true;
                }, 3000);
            }
        });

    }

    if (hub.uuid === maerskUuid) {
        await hub.connect();
        maersk = hub;
        maersk.setMotorSpeed("A", 50);

        maersk.on("color", async (port, color) => {
            console.log(color);

            if (color === 7 && moving && state === 0) {
                moving = false;
                maersk.setMotorSpeed("A", 0);
                await outer.setMotorSpeed("C", -100, 600);
                await maersk.sleep(2000);
                maersk.setMotorSpeed("A", -40);
                setTimeout(() => {
                    state = 1;
                    moving = true;
                }, 3000);
            }

            if (color === 7 && moving && state === 1) {
                moving = false;
                maersk.setMotorSpeed("A", 0);
                inner.setMotorSpeed("A", 100);
                await inner.sleep(600);
                inner.setMotorSpeed("A", 0);
                await maersk.sleep(2000);
                maersk.setMotorSpeed("A", 30);
                setTimeout(() => {
                    state = 2;
                    moving = true;
                }, 3000);
            }

            if (color === 7 && moving && state === 2) {
                moving = false;
                maersk.setMotorSpeed("A", 0);
                await outer.setMotorSpeed("C", 100, 600);
                await maersk.sleep(2000);
                horizon.setMotorSpeed("A", -60);
                setTimeout(() => {
                    state = 10;
                    moving = true;
                }, 6000);
            }

            if (color === 7 && moving && state === 3) {
                moving = false;
                maersk.setMotorSpeed("A", 0);
                inner.setMotorSpeed("A", -100);
                outer.setMotorSpeed("C", -100, 600);
                await inner.sleep(600);
                inner.setMotorSpeed("A", 0);
                await maersk.sleep(2000);
                maersk.setMotorSpeed("A", 30);
                setTimeout(() => {
                    state = 4;
                    moving = true;
                    setTimeout(() => {
                        maersk.setMotorSpeed("A", 50);
                    }, 4000);
                }, 3000);
            }

            if (color === 7 && moving && state === 4) {
                moving = false;
                await outer.setMotorSpeed("C", 100, 600);
                setTimeout(() => {
                    state = 0;
                    moving = true;
                }, 3000);
            }

            if (color === 9 && moving && state === 0) {
                moving = false;
                maersk.setMotorSpeed("A", 0);
                await maersk.sleep(2000);
                horizon.setMotorSpeed("A", -60);
                setTimeout(() => {
                    state = 11;
                    moving = true;
                }, 6000);
            }

        });
    }

});