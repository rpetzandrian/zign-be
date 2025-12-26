import test from 'ava';
import * as sinon from 'sinon';

import UserService from '../../src/service/user_service';
import UserRepository from '../../src/repository/user_repository';
import { User } from '../../src/entity/model/user';

const userRepository = new UserRepository({} as any);
const userService = new UserService(userRepository);

test.beforeEach('Initialize new sandbox before test', (t: any): any => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always('Restore sandbox after each test', (t: any): any => {
    t.context.sandbox.restore();
});

test.serial('[UserService] get user profile - case success', async (t: any): Promise<any> => {
    const userId = '123';
    const user: Partial<User> = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        is_email_verified: false,
        is_verified: false,
        is_face_recognized: false
    };

    t.context.sandbox.mock(userRepository).expects('getUserById').withExactArgs(userId).resolves(user);

    const result = await userService.getProfile(userId);

    t.is(result.id, userId);
    t.is(result.name, 'Test User');
    t.is(result.email, 'test@example.com');
});

test.serial('[UserService] get user profile - case user not found', async (t: any): Promise<any> => {
    const userId = '123';

    t.context.sandbox.mock(userRepository).expects('getUserById').withExactArgs(userId).resolves(null);

    const result = await userService.getProfile(userId).catch((error: any) => error);

    t.is(result.message, 'User not found');
    t.is(result.code, 'USER_NOT_FOUND');
});

