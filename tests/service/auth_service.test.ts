import test from 'ava';
import * as sinon from 'sinon';

import AuthService from '../../src/service/auth_service';
import UserRepository from '../../src/repository/user_repository';
import { User } from '../../src/entity/model/user';
import { hashPassword } from '../../src/lib/hash';
import { OTP_CODE_EXPIRED } from '../../src/entity/constant/common';

const userRepository = new UserRepository({} as any);
const authService = new AuthService(userRepository);

test.beforeEach('Initialize new sandbox before test', (t: any): any => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always('Restore sandbox after each test', (t: any): any => {
    t.context.sandbox.restore();
});

test.serial('[AuthService] Login - case success', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
        is_email_verified: true,
        is_verified: true,
        is_face_recognized: true
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOne').withExactArgs({ email }).resolves(user);
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').resolves();
    const publishEvent = t.context.sandbox.mock((authService as any).event).expects('publish').resolves();

    await authService.login(email, password);
    t.true(findUser.calledOnce);
    t.true(updateUser.calledOnce);
    t.true(publishEvent.calledOnce);
});

test.serial('[AuthService] Login - case user not exist', async (t: any): Promise<any> => {
    const email = 'test01@example.com';
    const password = 'password123!';

    const findUser = t.context.sandbox.mock(userRepository).expects('findOne').withExactArgs({ email }).resolves(null);
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').resolves();
    const publishEvent = t.context.sandbox.mock((authService as any).event).expects('publish').resolves();

    await authService.login(email, password)
    .catch((error) => {
        t.is(error.code, 'INVALID_EMAIL_OR_PASSWORD');
    });
    t.true(findUser.calledOnce);
    t.false(updateUser.calledOnce);
    t.false(publishEvent.calledOnce);
});

test.serial('[AuthService] Login - case password not match', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
        is_email_verified: true,
        is_verified: true,
        is_face_recognized: true
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOne').withExactArgs({ email }).resolves(user);
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').resolves();
    const publishEvent = t.context.sandbox.mock((authService as any).event).expects('publish').resolves();

    await authService.login(email, 'test123!')
    .catch((error) => {
        t.is(error.code, 'INVALID_EMAIL_OR_PASSWORD');
    });
    t.true(findUser.calledOnce);
    t.false(updateUser.calledOnce);
    t.false(publishEvent.calledOnce);
});

test.serial('[AuthService] Register - case sucess', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const name = 'Test User';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOne').withExactArgs({ email }, { attributes: ['id'] }).resolves(null);
    const createUser = t.context.sandbox.mock(userRepository).expects('create').resolves(user);
    const publishEvent = t.context.sandbox.mock((authService as any).event).expects('publish').resolves();

    await authService.registerUser({
        email,
        password,
        confirm_password: password,
        name,
    })
    .then(() => {
        t.true(findUser.calledOnce);
        t.true(createUser.calledOnce);
        t.true(publishEvent.calledOnce);
    });
});

test.serial('[AuthService] Register - case password not match', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const name = 'Test User';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOne').withExactArgs({ email }, { attributes: ['id'] }).resolves(null);
    const createUser = t.context.sandbox.mock(userRepository).expects('create').resolves(user);
    const publishEvent = t.context.sandbox.mock((authService as any).event).expects('publish').resolves();

    await authService.registerUser({
        email,
        password,
        confirm_password: 'test123!',
        name,
    })
    .catch((error) => {
        t.is(error.code, 'PASSWORD_MISMATCH');
        t.false(findUser.calledOnce);
        t.false(createUser.calledOnce);
        t.false(publishEvent.calledOnce);
    });
});

test.serial('[AuthService] Register - case already registered', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const name = 'Test User';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOne').withExactArgs({ email }, { attributes: ['id'] }).resolves(user);
    const createUser = t.context.sandbox.mock(userRepository).expects('create').resolves(user);
    const publishEvent = t.context.sandbox.mock((authService as any).event).expects('publish').resolves();

    await authService.registerUser({
        email,
        password,
        confirm_password: password,
        name,
    })
    .catch((error) => {
        t.is(error.code, 'EMAIL_ALREADY_REGISTERED');
        t.true(findUser.calledOnce);
        t.false(createUser.calledOnce);
        t.false(publishEvent.calledOnce);
    });
});

test.serial('[AuthService] Verify OTP - case success', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
        otp_code: '123456',
        otp_code_expired: new Date(Date.now() + OTP_CODE_EXPIRED * 60 * 1000),
        is_email_verified: false
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail').withExactArgs({ email }, { attributes: [ 'id', 'otp_code', 'otp_code_expired', 'is_email_verified' ] }).resolves(user);
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').withExactArgs({ id: user.id }, {
        is_email_verified: true,
    }).resolves();

    await authService.verifyOTP('123456', email)
    .then(() => {
        t.true(findUser.calledOnce);
        t.true(updateUser.calledOnce);
    });
});

test.serial('[AuthService] Verify OTP - case OTP mismatch', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
        otp_code: '123456',
        otp_code_expired: new Date(Date.now() + OTP_CODE_EXPIRED * 60 * 1000),
        is_email_verified: false
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail').withExactArgs({ email }, { attributes: [ 'id', 'otp_code', 'otp_code_expired', 'is_email_verified' ] }).resolves(user);
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').withExactArgs({ id: user.id }, {
        is_email_verified: true,
    }).resolves();

    await authService.verifyOTP('654321', email)
    .catch((error) => {
        t.is(error.code, 'OTP_MISMATCH');
        t.true(findUser.calledOnce);
        t.false(updateUser.calledOnce);
    });
});

test.serial('[AuthService] Verify OTP - case OTP expired', async (t: any): Promise<any> => {
    const email = 'test@example.com';
    const password = 'password123!';
    const user: Partial<User> = {
        id: '123',
        email,
        password: await hashPassword(password),
        otp_code: '123456',
        otp_code_expired: new Date(Date.now() - OTP_CODE_EXPIRED * 60 * 1000),
        is_email_verified: false
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail').withExactArgs({ email }, { attributes: [ 'id', 'otp_code', 'otp_code_expired', 'is_email_verified' ] }).resolves(user);
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').withExactArgs({ id: user.id }, {
        is_email_verified: true,
    }).resolves();

    await authService.verifyOTP('123456', email)
    .catch((error) => {
        t.is(error.code, 'OTP_EXPIRED');
        t.true(findUser.calledOnce);
        t.false(updateUser.calledOnce);
    });
});
