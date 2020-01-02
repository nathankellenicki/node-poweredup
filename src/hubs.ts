export { BaseHub } from "./hubs/generic/basehub";

import { DuploTrainBase } from "./hubs/duplotrainbase";
import { Hub } from "./hubs/hub";
import { MoveHub } from "./hubs/movehub";
import { RemoteControl } from "./hubs/remotecontrol";
import { TechnicMediumHub } from "./hubs/technicmediumhub";
import { WeDo2SmartHub } from "./hubs/wedo2smarthub";

export {
    DuploTrainBase,
    Hub,
    MoveHub,
    RemoteControl,
    TechnicMediumHub,
    WeDo2SmartHub,
};

export const hubs = {
    [WeDo2SmartHub.type]: WeDo2SmartHub,
    [MoveHub.type]: MoveHub,
    [Hub.type]: Hub,
    [RemoteControl.type]: RemoteControl,
    [DuploTrainBase.type]: DuploTrainBase,
    [TechnicMediumHub.type]: TechnicMediumHub,
};

export const hubType: {[typeName: string]: number} = {
    UNKNOW: 0,
};
export const hubTypeNames: {[typeName: number]: string } = {
    0: "UNKNOW",
};

for (const type in hubs) {
    if (hubs[+type]) {
        const hub = hubs[+type];
        hubType[hub.typeName] = hub.type;
        hubTypeNames[hub.type] = hub.typeName;
    }
}
