import { EventEmitter } from "events";

import { IDeviceInterface } from "../interfaces";
import { PortOutputCommand } from "../portoutputcommand";
import { PortOutputSleep } from "../portoutputsleep";

import * as Consts from "../consts";

import Debug = require("debug");
const debug = Debug("device");

/**
 * @class Device
 * @extends EventEmitter
 */
export class Device extends EventEmitter {

    public autoSubscribe: boolean = true;
    public values: {[event: string]: any} = {};

    protected _mode: number | undefined;
    protected _bufferLength: number = 0;
    protected _nextPortOutputCommands: (PortOutputCommand | PortOutputSleep)[] = [];
    protected _transmittedPortOutputCommands: PortOutputCommand[] = [];

    private _hub: IDeviceInterface;
    private _portId: number;
    private _connected: boolean = true;
    private _type: Consts.DeviceType;
    private _modeMap: {[event: string]: number} = {};

    private _isWeDo2SmartHub: boolean;
    private _isVirtualPort: boolean = false;

    constructor (hub: IDeviceInterface, portId: number, modeMap: {[event: string]: number} = {}, type: Consts.DeviceType = Consts.DeviceType.UNKNOWN) {
        super();
        this._hub = hub;
        this._portId = portId;
        this._type = type;
        this._modeMap = modeMap;
        this._isWeDo2SmartHub = (this.hub.type === Consts.HubType.WEDO2_SMART_HUB);
        this._isVirtualPort = this.hub.isPortVirtual(portId);

        const eventAttachListener = (event: string) => {
            if (event === "detach") {
                return;
            }
            if (this.autoSubscribe) {
                if (this._modeMap[event] !== undefined) {
                    this.subscribe(this._modeMap[event]);
                }
            }
        };

        const deviceDetachListener = (device: Device) => {
            if (device.portId === this.portId) {
                this._connected = false;
                this.hub.removeListener("detach", deviceDetachListener);
                this.emit("detach");
            }
        };

        for (const event in this._modeMap) {
            if (this.hub.listenerCount(event) > 0) {
                eventAttachListener(event);
            }
        }

        this.hub.on("newListener", eventAttachListener);
        this.on("newListener", eventAttachListener);
        this.hub.on("detach", deviceDetachListener);
    }

    /**
     * @readonly
     * @property {boolean} connected Check if the device is still attached.
     */
    public get connected () {
        return this._connected;
    }

    /**
     * @readonly
     * @property {Hub} hub The Hub the device is attached to.
     */
    public get hub () {
        return this._hub;
    }

    public get portId () {
        return this._portId;
    }

    /**
     * @readonly
     * @property {string} portName The port the device is attached to.
     */
    public get portName () {
        return this.hub.getPortNameForPortId(this.portId);
    }

    /**
     * @readonly
     * @property {number} type The type of the device
     */
    public get type () {
        return this._type;
    }

    public get typeName () {
        return Consts.DeviceTypeNames[this.type];
    }

    /**
     * @readonly
     * @property {number} mode The mode the device is currently in
     */
    public get mode () {
        return this._mode;
    }

    protected get isWeDo2SmartHub () {
        return this._isWeDo2SmartHub;
    }

    /**
     * @readonly
     * @property {boolean} isVirtualPort Is this device attached to a virtual port (ie. a combined device)
     */
    protected get isVirtualPort () {
        return this._isVirtualPort;
    }

    public writeDirect (mode: number, data: Buffer, interrupt: boolean = false) {
        if (this.isWeDo2SmartHub) {
            return this.send(Buffer.concat([Buffer.from([this.portId, 0x01, 0x02]), data]), Consts.BLECharacteristic.WEDO2_MOTOR_VALUE_WRITE).then(() => { return Consts.CommandFeedback.FEEDBACK_DISABLED; });
        } else {
            return this.sendPortOutputCommand(Buffer.concat([Buffer.from([0x51, mode]), data]), interrupt);
        }
    }

    public send (data: Buffer, characteristic: string = Consts.BLECharacteristic.LPF2_ALL) {
        this._ensureConnected();
        return this.hub.send(data, characteristic);
    }

    public subscribe (mode: number) {
        this._ensureConnected();
        if (mode !== this._mode) {
            this._mode = mode;
            this.hub.subscribe(this.portId, this.type, mode);
        }
    }

    public unsubscribe (mode: number) {
        this._ensureConnected();
    }

    public receive (message: Buffer) {
        this.notify("receive", { message });
    }

    public notify (event: string, values: any) {
        this.values[event] = values;
        this.emit(event, values);
        if (this.hub.listenerCount(event) > 0) {
            this.hub.emit(event, this, values);
        }
    }

    public requestUpdate () {
        this.send(Buffer.from([0x21, this.portId, 0x00]));
    }

    protected transmitNextPortOutputCommand() {
        if(!this.connected) {
            this._transmittedPortOutputCommands.forEach(command => command.resolve(Consts.CommandFeedback.FEEDBACK_MISSING));
            this._transmittedPortOutputCommands = [];
            this._nextPortOutputCommands.forEach(command => command.resolve(Consts.CommandFeedback.TRANSMISSION_DISCARDED));
            this._nextPortOutputCommands = [];
            return;
        }
        if(!this._nextPortOutputCommands.length) return;
        const nextCommand = this._nextPortOutputCommands[0];
        if(nextCommand instanceof PortOutputSleep) {
            if(nextCommand.state === Consts.CommandFeedback.EXECUTION_PENDING) {
                nextCommand.state = Consts.CommandFeedback.EXECUTION_BUSY;
                debug("sleep command ", nextCommand.duration);
                setTimeout(() => {
                    const command = this._nextPortOutputCommands.shift();
                    if(command) command.resolve(Consts.CommandFeedback.EXECUTION_COMPLETED);
                    this.transmitNextPortOutputCommand();
                }, nextCommand.duration);
            }
            return;
        }
        if(this._bufferLength !== this._transmittedPortOutputCommands.length) return;
        if(this._bufferLength < 2 || nextCommand.interrupt) {
            const command = this._nextPortOutputCommands.shift();
            if(command) {
                debug("transmit command ", command.startupAndCompletion, command.data);
                this.send(Buffer.concat([Buffer.from([0x81, this.portId, command.startupAndCompletion]), command.data]));
                command.state = Consts.CommandFeedback.TRANSMISSION_BUSY;
                this._transmittedPortOutputCommands.push(command);
                this.transmitNextPortOutputCommand(); // if PortOutputSleep this starts timeout
                // one could start a timer here to ensure finish function is called
            }
        }
    }

    public sendPortOutputCommand(data: Buffer, interrupt: boolean = false) {
        if (this.isWeDo2SmartHub) {
            throw new Error("PortOutputCommands are not available on the WeDo 2.0 Smart Hub");
            return;
        }
        const command = new PortOutputCommand(data, interrupt);
        if(interrupt) {
            this._nextPortOutputCommands.forEach(command => command.resolve(Consts.CommandFeedback.TRANSMISSION_DISCARDED));
            this._nextPortOutputCommands = [ command ];
        }
        else {
            this._nextPortOutputCommands.push(command);
        }
        this.transmitNextPortOutputCommand();
        return command.promise;
    }

    public addPortOutputSleep(duration: number) {
        const command = new PortOutputSleep(duration);
        this._nextPortOutputCommands.push(command);
        return command.promise;
    }

    public finish (message: number) {
        debug("recieved command feedback ", message);
        if((message & 0x08) === 0x08) this._bufferLength = 0;
        else if((message & 0x01) === 0x01) this._bufferLength = 1;
        else if((message & 0x10) === 0x10) this._bufferLength = 2;
        const completed = ((message & 0x02) === 0x02);
        const discarded = ((message & 0x04) === 0x04);

        switch(this._transmittedPortOutputCommands.length) {
            case 0:
                break;
            case 1:
                if(!this._bufferLength && completed && !discarded) {
                    this._complete();
                }
                else if(!this._bufferLength && !completed && discarded) {
                    this._discard();
                }
                else if(this._bufferLength && !completed && !discarded) {
                    this._busy();
                }
                else {
                    this._missing();
                }
                break;
            case 2:
                if(!this._bufferLength && completed && discarded) {
                    this._discard();
                    this._complete();
                }
                else if(!this._bufferLength && completed && !discarded) {
                    this._complete();
                    this._complete();
                }
                else if(!this._bufferLength && !completed && discarded) {
                    this._discard();
                    this._discard();
                }
                else if(this._bufferLength === 1 && completed && !discarded) {
                    this._complete();
                    this._busy();
                }
                else if(this._bufferLength === 1 && !completed && discarded) {
                    this._discard();
                    this._busy();
                }
                else if(this._bufferLength === 1 && completed && discarded) {
                    this._missing();
                    this._busy();
                }
                else if(this._bufferLength === 2 && !completed && !discarded) {
                    this._busy();
                    this._pending();
                }
                else {
                    this._missing();
                    this._missing();
                }
                break;
            case 3:
                if(!this._bufferLength && completed && discarded) {
                    this._discard();
                    this._discard();
                    this._complete();
                }
                else if(!this._bufferLength && completed && !discarded) {
                    this._complete();
                    this._complete();
                    this._complete();
                }
                else if(!this._bufferLength && !completed && discarded) {
                    this._discard();
                    this._discard();
                    this._discard();
                }
                else if(this._bufferLength === 1 && completed && discarded) {
                    this._discard();
                    this._complete();
                    this._busy();
                }
                else if(this._bufferLength === 1 && completed && !discarded) {
                    this._complete();
                    this._complete();
                    this._busy();
                }
                else if(this._bufferLength === 1 && !completed && discarded) {
                    this._discard();
                    this._discard();
                    this._busy();
                }
                else if(this._bufferLength === 1 && !completed && !discarded) {
                    this._missing();
                    this._missing();
                    this._busy();
                }
                // third command can only be interrupt, if this._bufferLength === 2 it was queued
                else {
                    this._missing();
                    this._missing();
                    this._missing();
                }
                break;
        }

        this.transmitNextPortOutputCommand();
    }

    private _ensureConnected () {
        if (!this.connected) {
            throw new Error("Device is not connected");
        }
    }

    private _complete () {
        const command = this._transmittedPortOutputCommands.shift();
        if(command) command.resolve(Consts.CommandFeedback.EXECUTION_COMPLETED);
    }
    private _discard () {
        const command = this._transmittedPortOutputCommands.shift();
        if(command) command.resolve(Consts.CommandFeedback.EXECUTION_DISCARDED);
    }
    private _missing () {
        const command = this._transmittedPortOutputCommands.shift();
        if(command) command.resolve(Consts.CommandFeedback.FEEDBACK_MISSING);
    }
    private _busy () {
        const command = this._transmittedPortOutputCommands[0];
        if(command) command.state = Consts.CommandFeedback.EXECUTION_BUSY;
    }
    private _pending () {
        const command = this._transmittedPortOutputCommands[1];
        if(command) command.state = Consts.CommandFeedback.EXECUTION_PENDING;
    }
}
