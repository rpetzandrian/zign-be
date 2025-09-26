import express, { Request, Response, Router } from 'express';
import logger from "../lib/logger";
import { Logger } from "winston";

export class Service {
    protected logger: Logger;

    public constructor() {
        this.logger = logger;
    }

    protected setRoutes(): void {
        // Implement in child classes
    }
}