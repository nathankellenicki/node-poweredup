import { CommandFeedback } from "./consts";
import { PortOutputCommand } from "./portoutputcommand";

export class PortOutputSleep extends PortOutputCommand {
    public duration: number
    constructor(duration: number) {
        super(Buffer.alloc(0), false);
        this.duration = duration;
        this.state = CommandFeedback.EXECUTION_PENDING;
    }
}
