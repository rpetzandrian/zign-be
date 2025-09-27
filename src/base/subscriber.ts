import { Logger } from "winston";
import logger from "../lib/logger";


export abstract class EventSubscriber<T> {
    private _event: string
    protected logger: Logger;

    constructor(event: string) {
        this._event = event;
        this.logger = logger;
    }

    abstract handler(payload: T): Promise<void>;

    getEvent(): string {
        return this._event;
    }
}

export default EventSubscriber;

