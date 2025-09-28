import { RegisterUserDto, UserTokenResponse } from "../entity/dto/auth";
import { Service } from "../base/service";
import UserRepository from "../repository/user_repository";
import { BadRequestError } from "../base/http_error";
import { comparePassword, hashPassword } from "../lib/hash";
import { EMAIL_CODE, EVENT_LIST, OTP_CODE_EXPIRED } from "../entity/constant/common";
import { generateJwtToken } from "../lib/jwt";


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

    public async registerUser(data: RegisterUserDto): Promise<UserTokenResponse> {
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

        // Generate token
        const token = generateJwtToken(user.id as string);

        return { token, expires_in: Number(process.env.JWT_LIFETIME) };
    }

    public async resendOtpEmail(userId: string): Promise<void> {
        const user = await this.userRepository.findOneOrFail({ id: userId });  
        await this.sendOtpCodeToEmail(user.email, user.otp_code as string);
    }

    public async login(email: string, password: string): Promise<UserTokenResponse> {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new BadRequestError('Invalid email or password')
        }

        if (!await comparePassword(password, user.password as string)) {
            throw new BadRequestError('Invalid email or password')
        }

        // Generate token
        const token = generateJwtToken(user.id as string);

        return { token, expires_in: Number(process.env.JWT_LIFETIME) };
    }
}