import * as Consts from "./consts";

import { PoweredUP } from "./poweredup-browser";

import { BoostMoveHub } from "./boostmovehub";
import { ControlPlusHub } from "./controlplushub";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";

import { ColorDistanceSensor } from "./colordistancesensor";
import { ControlPlusLargeMotor } from "./controlpluslargemotor";
import { Device } from "./device";

import { isWebBluetooth } from "./utils";

// @ts-ignore
window.PoweredUP = {
    PoweredUP,
    Hub,
    WeDo2SmartHub,
    BoostMoveHub,
    ControlPlusHub,
    PUPHub,
    PUPRemote,
    DuploTrainBase,
    Consts,
    Device,
    ColorDistanceSensor,
    ControlPlusLargeMotor,
    isWebBluetooth
};

