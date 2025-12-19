import { Device } from "./device.js";

import { IDeviceInterface } from "../interfaces.js";

import * as Consts from "../consts.js";

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
     * @param {DuploTrainBaseSound} sound
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public playSound (sound: Consts.DuploTrainBaseSound) {
        this.subscribe(Mode.SOUND);
        return this.writeDirect(0x01, Buffer.from([sound]));
    }

    /**
     * Play a built-in system tone.
     * @param {number} tone
     * @returns {Promise<CommandFeedback>} Resolved upon completion of command.
     */
    public playTone (tone: number) {
        this.subscribe(Mode.TONE);
        return this.writeDirect(0x02, Buffer.from([tone]));
    }

}

export enum Mode {
    SOUND = 0x01,
    TONE = 0x02
}
