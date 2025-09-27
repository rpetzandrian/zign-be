
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