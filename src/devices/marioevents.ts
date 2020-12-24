import { Device } from "./device";

import { IDeviceInterface } from "../interfaces";

import * as Consts from "../consts";

/**
 * @class MarioEvents
 * @extends Device
 */
export class MarioEvents extends Device {

    private _events: number[] = [];
    private _coins: { [enemy: number]: number } = {};
    private _started: boolean = false;

    constructor (hub: IDeviceInterface, portId: number) {
        super(hub, portId, ModeMap, Consts.DeviceType.MARIO_EVENTS);
    }

    public receive (message: Buffer) {
        const mode = this._mode;

        switch (mode) {
            case Mode.EVENT:
                const type = message[5];
                const value = message[6];
                if (type === 0x13) {
                    const event = value;
                    if (event === 0xb8 && !this._started) {
                        this._started = true;
                        this._events = [];
                        this._coins = {};
                    }
                    this._events.push(value);
                    if (this._started) {
                        this.notify("event", Object.assign(
                            { event },
                            (event === 0xb7) ? { history: this._events, coins: this._coins } : {}
                        ));
                    }
                    if (event === 0xb7) {
                        this._started = false;
                    }
                } else if (type === 0x20) {
                    if (!this._started) {
                        break;
                    }
                    const enemy = message[4];
                    let coins = value;
                    if (coins === 0) {
                        break;
                    }
                    if (this._coins[enemy]) {
                        coins -= this._coins[enemy];
                        this._coins[enemy] += coins;
                    } else {
                        this._coins[enemy] = coins;
                    }
                    this.notify("event", { enemy, coins });
                }
                break;
        }
    }

}

export enum Mode {
    EVENT = 0x02,
}

export const ModeMap: {[event: string]: number} = {
    "event": Mode.EVENT,
};
