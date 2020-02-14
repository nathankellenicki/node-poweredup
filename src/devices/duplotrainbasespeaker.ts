import { Device } from "./device";

import { IHubInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTrainBaseSpeaker
 * @extends Device
 */
export class DuploTrainBaseSpeaker extends Device {

    public static Mode = {
        SOUND: 0x01
    }

    constructor (hub: IHubInterface, portId: number) {
        super(hub, portId, {}, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEAKER);
    }

    /**
     * Play a built-in train sound.
     * @method DuploTrainBaseSpeaker#playSound
     * @param {DuploTrainBaseSound} sound
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public playSound (sound: Consts.DuploTrainBaseSound) {
        return new Promise((resolve, reject) => {
            this.subscribeSingle(DuploTrainBaseSpeaker.Mode.SOUND);
            this.writeDirect(0x01, Buffer.from([sound]));
            return resolve();
        });
    }

}
