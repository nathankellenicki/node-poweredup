import { BoostMoveHub } from "./boostmovehub";
import * as Consts from "./consts";
import { DuploTrainBase } from "./duplotrainbase";
import { Hub } from "./hub";
import { PoweredUP as PoweredUPNode } from "./poweredup-node";
import { PUPHub } from "./puphub";
import { PUPRemote } from "./pupremote";
import { WeDo2SmartHub } from "./wedo2smarthub";
import { isBrowserContext } from "./utils";

let PoweredUP;

export default PoweredUP;
export { PoweredUP, Hub, WeDo2SmartHub, BoostMoveHub, PUPHub, PUPRemote, DuploTrainBase, Consts };

if (!isBrowserContext) {
    PoweredUP = PoweredUPNode;
}
