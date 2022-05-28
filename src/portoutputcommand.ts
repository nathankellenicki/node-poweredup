import { CommandFeedback } from "./consts";
import Debug = require("debug");
const debug = Debug("device");

export class PortOutputCommand {

    public data: Buffer;
    public interrupt: boolean;
    public state: CommandFeedback;
    private _promise: Promise<CommandFeedback>;
    private _resolveCallback: any;

    constructor (data: Buffer, interrupt: boolean) {
        this.data = data;
        this.interrupt = interrupt;
        this.state = CommandFeedback.TRANSMISSION_PENDING;
        this._promise = new Promise<CommandFeedback>((resolve) => {
            this._resolveCallback = () => resolve(this.state);
        });
    }

    public get startupAndCompletion () {
        let val = 0x01; // request feedback
        if(this.interrupt) val |= 0x10;
        return val;
    }

    public get promise () {
        return this._promise;
    }

    public resolve(feedback: CommandFeedback) {
        debug("complete command ", this.startupAndCompletion, this.data, " result: ", feedback);
        this.state = feedback;
        this._resolveCallback();
    }
}
