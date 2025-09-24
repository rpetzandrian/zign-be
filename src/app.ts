import { PrismaClient } from '@prisma/client';
import UserRepository from './repository/user_repository';
import { UserService } from './services/user_service';
import express from 'express';
import BaseApp from './base/app';

class App extends BaseApp {
    constructor({ port = 8000 }) {
        super({ port })
    }

    protected initPluggins() {
        this._app.use(express.json())
        this._app.use(express.urlencoded({ extended: false }))

        this._app.get('/healthcheck', (req, res) => {
            res.send({
                message: 'Hello World!'
            })
        })
    }

    protected async initServices() {
        const prismaClient = new PrismaClient()
        await prismaClient.$connect()

        const userRepository = new UserRepository(prismaClient);

        const userService = new UserService(userRepository)

        this._app.use('/users', userService._routes)
    }
}

export default App;
