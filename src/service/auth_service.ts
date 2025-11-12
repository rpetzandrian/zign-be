import { RegisterUserDto, ResetPasswordDto, UserTokenResponse } from "../entity/dto/auth";
import { Service } from "../base/service";
import UserRepository from "../repository/user_repository";
import { BadRequestError } from "../base/http_error";
import { comparePassword, hashPassword } from "../lib/hash";
import { EMAIL_CODE, EVENT_LIST, OTP_CODE_EXPIRED } from "../entity/constant/common";
import { generateJwtToken } from "../lib/jwt";
import { User } from "../entity/model/user";
import { isAfter } from "date-fns";
import { string } from "joi";


export class AuthService extends Service {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        super()
        this.userRepository = userRepository
    }

    private async generateOtpCodeAndExpired(): Promise<{ code: string, expired: Date }> {
        // Set OTP code expired in 10 minutes
        const expired = new Date(Date.now() + OTP_CODE_EXPIRED * 60 * 1000);
        // Generate OTP code
        // if dev send otp code 123456
        if (process.env.NODE_ENV !== 'production') {
            return { code: '123456', expired: expired }
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        return { code, expired };
    }

    private async sendOtpCodeToEmail(email: string, code: string): Promise<void> {
        // Send OTP code to user email
        await this.event.publish(EVENT_LIST.SEND_EMAIL, {
            code : EMAIL_CODE.OTP,
            to: [email],
            parameters: {
                otp: code
            }
        });
    }

    public async registerUser(data: RegisterUserDto): Promise<void> {
        if (data.password !== data.confirm_password) {
            throw new BadRequestError('Password and confirm password must be same')
        }

        // Generate OTP code and expired
        const { code, expired } = await this.generateOtpCodeAndExpired();

        const user = await this.userRepository.create({
            name: data.name,
            email: data.email,
            password: await hashPassword(data.password),
            otp_code: code,
            otp_code_expired: expired
        });

        // Send OTP code to user email
        await this.sendOtpCodeToEmail(user.email, code);
    }

    public async resendOtpEmail(userId: string): Promise<void> {
        const user = await this.userRepository.findOneOrFail({ id: userId });  
        await this.sendOtpCodeToEmail(user.email, user.otp_code as string);
    }

    public async login(email: string, password: string): Promise<void> {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new BadRequestError('Invalid email or password')
        }

        if (!await comparePassword(password, user.password as string)) {
            throw new BadRequestError('Invalid email or password')
        }

        // Generate OTP code and expired
        const { code, expired } = await this.generateOtpCodeAndExpired();

        await this.userRepository.update({ id: user.id }, {
            otp_code: code,
            otp_code_expired: expired
        });

        // Send OTP code to user email
        await this.sendOtpCodeToEmail(user.email, code);
    }

    private validateOtp(user: User, otp: string) {
        if (user.otp_code !== otp) {
            throw new BadRequestError('OTP mismatch', 'OTP_MISMATCH');
        }

        if (isAfter(new Date(), user.otp_code_expired as Date)) {
            throw new BadRequestError('OTP expired', 'OTP_EXPIRED');
        }
    }

    public async verifyOTP(otp: string, email: string):  Promise<UserTokenResponse> {
        const user = await this.userRepository.findOneOrFail({ email }, { attributes: ['id', 'otp_code', 'otp_code_expired', 'is_email_verified'] });
        this.validateOtp(user, otp);

        if (!user.is_email_verified) {
            await this.userRepository.update({ id: user.id }, { is_email_verified: true });
        }

        // Generate token
        const token = generateJwtToken(user.id as string, process.env.JWT_LIFETIME as string);
        return { token, expires_in: Number(process.env.JWT_LIFETIME) };
    }

    public async forgotPassword(email: string): Promise<{ token: string }> {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new BadRequestError('User not found or email is invalid.');
        }
        const { code, expired } = await this.generateOtpCodeAndExpired();
        const resetToken = generateJwtToken(user.id as string, '1h');

        await this.userRepository.update({ id: user.id }, {
            otp_code: code,
            otp_code_expired: expired,
            reset_token: resetToken
        });
        
        await this.event.publish(EVENT_LIST.SEND_EMAIL,  {
            code: EMAIL_CODE.FORGOT_PASSWORD, 
            to: [user.email],
            parameters: {
                otp: code,
                token: resetToken
            }
        });
        return {token: resetToken};
    }
    public async resetPassword(data: ResetPasswordDto): Promise<void> {
        const { password, confirm_password, token, otp_code } = data;
        if (password !== confirm_password) {
            throw new BadRequestError('Password and confirm password must be same');
        }
        const user = await this.userRepository.findOneOrFail({ reset_token: token }, 
            { attributes: ['id', 'otp_code', 'otp_code_expired', 'password'] }
        );
        this.validateOtp(user, otp_code);
        const newHashedPassword = await hashPassword(password);
        await this.userRepository.update({ id: user.id }, {
            password: newHashedPassword,
            reset_token: null,
            otp_code: null,
            otp_code_expired: null
        });
    }
}