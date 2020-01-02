import * as Consts from "./consts";

import { PoweredUP } from "./poweredup-browser";

import * as devices from "./devices";
import * as hubs from "./hubs";

import { isWebBluetooth } from "./utils";

// @ts-ignore
window.PoweredUP = {
    PoweredUP,
    ...hubs,
    Consts,
    ...devices,
    isWebBluetooth
};
