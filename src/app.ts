import { PrismaClient } from '@prisma/client';
import UserRepository from './repository/user_repository';
import { UserService } from './service/user_service';
import express from 'express';
import BaseApp from './base/app';
import { getPrismaClientWithSoftDelete } from './base/prisma_middleware';
import { UserController } from './controller/user_controller';
import { EmailService } from './service/email_service';
import { AuthService } from './service/auth_service';
import MailtrapEmailProvider from './lib/email_provider';
import { AuthController } from './controller/auth_controller';
import EventProvider from './lib/event_provider';
import { SendEmailSubscriber } from './subsriber/send_email_subscriber';

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

    protected async initProviders() {
        /** Initialize providers */
        await EventProvider.initialize();

        if (process.env.FEATURE_TURN_OFF_EMAIL !== '1') {
            MailtrapEmailProvider.initialize();
        }
    }

    protected async initServices() {
        const prismaClient = new PrismaClient({})
        const prisma = getPrismaClientWithSoftDelete(prismaClient)
        await prisma.$connect()

        /** Initialize providers */
        const emailProvider = new MailtrapEmailProvider()
        const eventProvider = new EventProvider();

        /** Initialize repositories */
        const userRepository = new UserRepository(prisma);

        /** Initialize services */
        const userService = new UserService(userRepository);
        const emailService = new EmailService(emailProvider);
        const authService = new AuthService(userRepository);

        /** Initialize controllers */
        const authController = new AuthController(authService);
        const userController = new UserController(userService);

        /** Initialize event subscribers */
        const sendEmailSubscriber = new SendEmailSubscriber(emailService);

        /** Register routes */
        this._app.use('/', authController._routes)
        this._app.use('/', userController._routes)

        /** Register event subscribers */
        eventProvider.subscribe(sendEmailSubscriber);
    }
}

export default App;
