import logger from "../lib/logger";
import { Logger } from "winston";
import EventProvider from '../lib/event_provider';

export class Service {
    protected logger: Logger;
    protected event: EventProvider;

    public constructor() {
        this.logger = logger;
        this.event = new EventProvider();
    }

    protected setRoutes(): void {
        // Implement in child classes
    }
}