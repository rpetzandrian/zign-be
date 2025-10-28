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
import { AiProvider } from './lib/ai_provider';
import { VerificationService } from './service/verification_service';
import { VerificationController } from './controller/verification_controller';
import S3Provider from './lib/s3-provider';
import { FileService } from './service/file_service';
import FileRepository from './repository/file_repository';
import { DocumentService } from './service/document_service';
import { DocumentController } from './controller/document_controller';
import DocumentRepository from './repository/document_repository';
import SignRepository from './repository/sign_repository';
import { SignService } from './service/sign_service';
import { SignController } from './controller/sign_controller';

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

        if (process.env.FEATURE_TURN_OFF_AI !== '1') {
            AiProvider.initialize();
        }

        S3Provider.initialize();
    }

    protected async initServices() {
        const prismaClient = new PrismaClient({})
        const prisma = getPrismaClientWithSoftDelete(prismaClient)
        await prisma.$connect()

        /** Initialize providers */
        const emailProvider = new MailtrapEmailProvider()
        const eventProvider = new EventProvider();
        const aiProvider = new AiProvider();
        const s3Provider = new S3Provider();

        /** Initialize repositories */
        const userRepository = new UserRepository(prisma);
        const fileRepository = new FileRepository(prisma);
        const documentRepository = new DocumentRepository(prisma);
        const signRepository = new SignRepository(prisma);

        /** Initialize services */
        const userService = new UserService(userRepository);
        const emailService = new EmailService(emailProvider);
        const authService = new AuthService(userRepository);
        const fileService = new FileService(fileRepository, s3Provider);
        const verificationService = new VerificationService(userRepository, aiProvider, fileService);
        const documentService = new DocumentService(fileService, documentRepository, signRepository);
        const signService = new SignService(fileService, signRepository);

        /** Initialize controllers */
        const authController = new AuthController(authService);
        const userController = new UserController(userService);
        const verificationController = new VerificationController(verificationService, fileService);
        const documentController = new DocumentController(documentService);
        const signController = new SignController(signService);

        /** Initialize event subscribers */
        const sendEmailSubscriber = new SendEmailSubscriber(emailService);

        /** Register routes */
        this._app.use('/', authController._routes)
        this._app.use('/', userController._routes)
        this._app.use('/', verificationController._routes)
        this._app.use('/', documentController._routes)
        this._app.use('/', signController._routes)

        /** Register event subscribers */
        eventProvider.subscribe(sendEmailSubscriber);
    }
}

export default App;
