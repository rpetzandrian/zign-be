import { SendEmailPayload } from "../entity/interface/mail";
import EventSubscriber from "../base/subscriber";
import { EVENT_LIST } from "../entity/constant/common";
import { EmailService } from "../service/email_service";

export class SendEmailSubscriber extends EventSubscriber<SendEmailPayload> {
    private emailService: EmailService;

    constructor(emailService: EmailService) {
        super(EVENT_LIST.SEND_EMAIL);
        this.emailService = emailService;
    }

    public async handler(payload: SendEmailPayload): Promise<void> {
        this.logger.info(`[SendEmail] sending email to -> ${payload.to} with code -> ${payload.code}`);
        await this.emailService.send(payload);
    }
}