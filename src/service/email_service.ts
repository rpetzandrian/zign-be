import renderTemplate from "../lib/render_template";
import { SendEmailPayload } from "../entity/interface/mail";
import MailtrapEmailProvider from "../lib/email_provider";
import { EMAIL_CODE } from "../entity/constant/common";
import fs from 'fs';
import path from "path";
import { Service } from "../base/service";



export class EmailService extends Service {
    private emailProvider: MailtrapEmailProvider;
    constructor(emailProvider: MailtrapEmailProvider) {
        super()
        this.emailProvider = emailProvider
    }

    private getTemplate(code: string): { content: string, subject: string } {
        if (code === EMAIL_CODE.OTP) {
            const content = fs.readFileSync(path.join(__dirname, '../data/otp_email_template.handlebars'), 'utf-8');
            return {
                content,
                subject: 'Selamat Datang di Zign! Ini Kode Verifikasi Anda'
            }
        }

        return {
            content: '',
            subject: ''
        }
    }

    public async send(payload: SendEmailPayload): Promise<void> {
        const templates = this.getTemplate(payload.code);
        const content = renderTemplate(templates.content, payload.parameters || {});
        
        await this.emailProvider.send({
            content,
            subject: templates.subject,
            to: payload.to,
            from: {
                email: 'no-reply@zign.id',
                name: 'Zign'
            },
            cc: payload.cc
        });
    }
}