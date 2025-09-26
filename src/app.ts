import { PrismaClient } from '@prisma/client';
import UserRepository from './repository/user_repository';
import { UserService } from './service/user_service';
import express from 'express';
import BaseApp from './base/app';
import { getPrismaClientWithSoftDelete } from './base/prisma_middleware';
import { UserController } from './controller/user_controller';

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
        const prismaClient = new PrismaClient({})
        const prisma = getPrismaClientWithSoftDelete(prismaClient)
        await prisma.$connect()

        /** Initialize repositories */
        const userRepository = new UserRepository(prisma);

        /** Initialize services */
        const userService = new UserService(userRepository)

        /** Initialize controllers */
        const userController = new UserController(userService);

        /** Register routes */
        this._app.use('/', userController._routes)
    }
}

export default App;
