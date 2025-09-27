import { RegisterUserDto } from "../entity/dto/auth";
import { Service } from "../base/service";
import UserRepository from "../repository/user_repository";
import { BadRequestError } from "../base/http_error";
import hashPassword from "../lib/hash";
import { EmailService } from "./email_service";
import { EMAIL_CODE, OTP_CODE_EXPIRED } from "../entity/constant/common";


export class AuthService extends Service {
    private userRepository: UserRepository;
    private emailService: EmailService;

    constructor(userRepository: UserRepository, emailService: EmailService) {
        super()
        this.userRepository = userRepository
        this.emailService = emailService
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
        await this.emailService.send({
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
}