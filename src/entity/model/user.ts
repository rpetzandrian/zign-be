import { BaseModel } from "./base";

export interface User extends BaseModel {
    name: string;
    email: string;
    password: string;
    card_no?: string;
    is_email_verified: boolean;
    is_verified: boolean;
    is_face_recognized: boolean;
    profile_picture?: string;
    otp_code: string | null;
    otp_code_expired: Date | null;
    reset_token: string | null;
}