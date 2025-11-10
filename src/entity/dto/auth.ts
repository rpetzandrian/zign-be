
export interface RegisterUserDto {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
}

export interface UserTokenResponse {
    token: string;
    expires_in: number;
}

export interface forgetPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    password : string;
    confirm_password: string;
    token: string;
    otp_code: string;
}

