const noble = require("noble"),
    debug = require("debug")("lpf2"),
    EventEmitter = require("events").EventEmitter;

const Hub = require("./hub.js"),
    Consts = require("./consts.js");

let ready = false,
    wantScan = false;

noble.on("stateChange", (state) => {
    ready = (state === "poweredOn");
    if (ready) {
        if (wantScan) {
            noble.startScanning();
        }
    } else {
        noble.stopScanning();
    }
});

class LPF2 extends EventEmitter {


    constructor () {
        super();
        this._connectedDevices = {};
    }


    scan () {
        wantScan = true;

        noble.on("discover", (peripheral) => {

            let advertisement = peripheral.advertisement;

            if (advertisement.localName === Consts.BLE.Name.WEDO2_SMART_HUB_NAME && advertisement.serviceUuids.indexOf(Consts.BLE.Services.WEDO2_SMART_HUB) >= 0) {

                peripheral.removeAllListeners();
                noble.stopScanning();
                noble.startScanning();

                const hub = new Hub(peripheral);

                hub._peripheral.on("connect", () => {
                    debug("Hub connected");
                    this._connectedDevices[hub.uuid] = hub;
                });

                hub._peripheral.on("disconnect", () => {
                    debug("Peripheral disconnected");
                    delete this._connectedDevices[hub.uuid];

                    if (wantScan) {
                        noble.startScanning();
                    }

                    hub.emit("disconnect");
                });

                this.emit("discover", hub);

            }
        });

        if (ready) {
            noble.startScanning();
        }
    }


}


module.exports = LPF2;