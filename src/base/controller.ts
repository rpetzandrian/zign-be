import { Router } from "express"
import logger from "../lib/logger";
import { Logger } from "winston";


export class Controller {
    _routes: Router;
    path: string;
    private logger: Logger;

    constructor(path: string) {
        this.path = path
        this._routes = Router({mergeParams: true})
        this.logger = logger;

        this.setRoutes()
    }

    protected setRoutes(): void {
        // Implement in child classes
    }
}

export default Controller