import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class DuploTrainBaseSpeaker extends Device {


    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, {}, Consts.DeviceType.DUPLO_TRAIN_BASE_SPEAKER);
    }


    /**
     * Play a built-in train sound.
     * @method DuploTrainBaseSpeaker#playSound
     * @param {DuploTrainBaseSound} sound
     * @returns {Promise} Resolved upon successful issuance of command.
     */
    public playSound (sound: Consts.DuploTrainBaseSound) {
        return new Promise((resolve, reject) => {
            this.subscribe(DuploTrainBaseSpeaker.Mode.SOUND);
            this.writeDirect(0x01, Buffer.from([sound]));
            return resolve();
        });
    }


}

export namespace DuploTrainBaseSpeaker {

    export enum Mode {
        SOUND = 0x01
    }

}