import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class DuploTrainBaseSpeaker
 * @extends Device
 */
export class DuploTrainBaseSpeaker extends Device {

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEAKER);
    }

    /**
     * Play a built-in train sound.
     * @method DuploTrainBaseSpeaker#playSound
     * @param {DuploTrainBaseSound} sound
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public playSound (sound: Consts.DuploTrainBaseSound) {
        return new Promise<void>((resolve) => {
            this.subscribe(Mode.SOUND);
            this.writeDirect(0x01, Buffer.from([sound]));
            return resolve();
        });
    }

    /**
     * Play a built-in system tone.
     * @method DuploTrainBaseSpeaker#playTone
     * @param {number} tone
     * @returns {Promise} Resolved upon successful issuance of the command.
     */
    public playTone (tone: number) {
        this.subscribe(Mode.TONE);
        this.writeDirect(0x02, Buffer.from([tone]));
    }

}

export enum Mode {
    SOUND = 0x01,
    TONE = 0x02
}
