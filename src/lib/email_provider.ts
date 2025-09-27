import * as mailer from 'nodemailer';
import { EmailProviderSendPayload } from '../entity/interface/mail';
import logger from './logger';

export class MailtrapEmailProvider {
    static instance: mailer.Transporter | null =  null;

    static initialize(): void {
        if (!MailtrapEmailProvider.instance) {
            MailtrapEmailProvider.instance = mailer.createTransport({
                host: process.env.MAILTRAP_HOST as string,
                port: Number(process.env.MAILTRAP_PORT),
                secure: false,
                auth: {
                    user: process.env.MAILTRAP_USER as string,
                    pass: process.env.MAILTRAP_PASS as string,
                },
                pool: true,
                maxConnections: 1
            });
        }
    }

    public async send(payload: EmailProviderSendPayload): Promise<void> {
        if (!MailtrapEmailProvider.instance) {
            logger.error('MailtrapEmailProvider not initialized');
            return;
        }

        const mailtrapPayload: mailer.SendMailOptions = {
            html: payload.content,
            subject: payload.subject,
            from: {
                address: payload.from.email,
                name: payload.from.name,
            },
            to: payload.to,
            cc: payload.cc ? payload.cc.map(email => email) : [],
        };

        await MailtrapEmailProvider.instance.sendMail(mailtrapPayload);
    }
}

export default MailtrapEmailProvider;
