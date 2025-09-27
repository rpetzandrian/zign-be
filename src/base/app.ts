import express from 'express';
import GlobalExceptionHandler from './global_exception_handler';
import NotFoundExceptionHandler from './not_found_error_handler';

export class BaseApp {
    protected _port : number
    protected _app : express.Application
    constructor({ port = 8000 }) {
        this._port = port;
        this._app = express()
    }

    public async initialize(): Promise<void> {
        this.initPluggins()
        this.initProviders()
        await this.initServices()
        await this.initExceptionHandlers();
    }

    private async initExceptionHandlers(): Promise<void> {
        this._app.use(NotFoundExceptionHandler);
        this._app.use(GlobalExceptionHandler);
    }

    public async startApp(): Promise<this> {
        this._app.listen(this._port, () => {
            console.log('Server is running on port: ' + this._port);
        });

        return this;
    }

    protected initPluggins() {
        /** Impement in child classes */
    }

    protected initProviders() {
        /** Impement in child classes */
    }

    protected async initServices() {
        /** Impement in child classes */
    }
}

export default BaseApp;
