import { Device, DeviceVersion } from "./generic/device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

export class DuploTrainBaseSpeaker extends Device {
    protected static _type = 42;


    constructor (hub: IDeviceInterface, portId: number, versions: DeviceVersion) {
        super(hub, portId, versions, {});
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