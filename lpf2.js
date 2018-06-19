const noble = require("noble"),
    debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const WeDo2Hub = require("./wedo2hub.js"),
    BoostHub = require("./boosthub.js"),
    Consts = require("./consts.js");

let ready = false,
    wantScan = false;

noble.on("stateChange", (state) => {
    ready = (state === "poweredOn");
    if (ready) {
        if (wantScan) {
            debug("Scanning started");
            noble.startScanning();
        }
    } else {
        noble.stopScanning();
    }
});

class LPF2 extends EventEmitter {


    constructor () {
        super();
        this.autoSubscribe = true;
        this._connectedDevices = {};
    }


    scan () {
        wantScan = true;

        noble.on("discover", (peripheral) => {

            let hub = null;

            if (WeDo2Hub.isWeDo2Hub(peripheral)) {
                hub = new WeDo2Hub(peripheral, this.autoSubscribe);
            } else if (BoostHub.isBoostHub(peripheral)) {
                hub = new BoostHub(peripheral, this.autoSubscribe);
            } else {
                return;
            }

            peripheral.removeAllListeners();
            noble.stopScanning();
            noble.startScanning();

            hub._peripheral.on("connect", () => {
                debug(`Hub ${hub.uuid} connected`);
                this._connectedDevices[hub.uuid] = hub;
            });

            hub._peripheral.on("disconnect", () => {
                debug(`Hub ${hub.uuid} disconnected`);
                delete this._connectedDevices[hub.uuid];

                if (wantScan) {
                    noble.startScanning();
                }

                hub.emit("disconnect");
            });

            debug(`Hub ${hub.uuid} discovered`);
            this.emit("discover", hub);

        });

        if (ready) {
            debug("Scanning started");
            noble.startScanning();
        }
    }


}


module.exports = LPF2;