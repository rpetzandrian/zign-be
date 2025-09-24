import express from 'express';

export class BaseApp {
    protected _port : number
    protected _app : express.Application
    constructor({ port = 8000 }) {
        this._port = port;
        this._app = express()
    }

    public async initialize(): Promise<void> {
        this.initPluggins()
        await this.initServices()
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

    protected async initServices() {
        /** Impement in child classes */
    }
}

export default BaseApp;
