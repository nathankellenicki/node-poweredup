import { BoostMoveHub } from "./boostmovehub";
import * as Consts from "./consts";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { PoweredUP } from "./poweredup-browser";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";

import { isWebBluetooth } from "./utils";

// @ts-ignore
window.PoweredUP = { PoweredUP, Hub, WeDo2SmartHub, BoostMoveHub, PUPHub, PUPRemote, DuploTrainBase, Consts, isWebBluetooth };
