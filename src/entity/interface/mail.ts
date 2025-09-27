export interface EmailProviderSendPayload {
    content: string;
    subject: string;
    to: string[];
    from: {
        email: string;
        name: string;
    };
    cc?: string[];
}

export interface SendEmailPayload {
    code: string;
    to: string[];
    parameters?: Record<string, string>;
    cc?: string[];
}