import express, { Request, Response, Router } from 'express';
import logger from "../lib/logger";
import { Logger } from "winston";

export class Service {
    protected logger: Logger;
    _routes: Router

    public constructor() {
        this.logger = logger;
        this._routes = Router({mergeParams: true})

        this.setRoutes()
    }

    protected setRoutes(): void {
        // Implement in child classes
    }
}