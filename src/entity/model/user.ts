import { BaseModel } from "./base";

export interface User extends BaseModel {
    name: string;
    email: string;
    password: string;
    card_no?: string;
    is_email_verified: boolean;
    is_verified: boolean;
    profile_picture?: string;
    otp_code?: string;
    otp_code_expired?: Date;
}