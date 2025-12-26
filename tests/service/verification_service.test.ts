import test from 'ava';
import * as sinon from 'sinon';

import VerificationService from '../../src/service/verification_service';
import UserRepository from '../../src/repository/user_repository';
import { AiProvider } from '../../src/lib/ai_provider';
import { FileService } from '../../src/service/file_service';
import FacePlusProvider from '../../src/lib/faceplus_provider';
import FileOwnerRepository from '../../src/repository/file_owner_repository';
import { Files } from '../../src/entity/constant/file';
import { User } from '../../src/entity/model/user';

const userRepository = new UserRepository({} as any);
const aiProvider = new AiProvider();
const fileService = new FileService({} as any, {} as any, {} as any);
const facePlusProvider = new FacePlusProvider({} as any);
const fileOwnerRepository = new FileOwnerRepository({} as any);
const verificationService = new VerificationService(userRepository, aiProvider, fileService, facePlusProvider, fileOwnerRepository);

test.beforeEach('Initialize new sandbox before test', (t: any): any => {
    process.env.FEATURE_TURN_OFF_AI='false';
    process.env.FEATURE_TURN_OFF_FACE_RECOGNITION='false';
    process.env.IMAGE_BUCKET='image-bucket';
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always('Restore sandbox after each test', (t: any): any => {
    t.context.sandbox.restore();
});

test.serial('[VerificationService] OCR verification - case success', async (t: any): Promise<void> => {
    const files: Files[] = [
        {
            buffer: Buffer.from(''),
            fieldname: 'card_identity',
            originalname: 'card_identity.jpg',
            mimetype: 'image/jpeg',
            size: 1000,
        },
        {
            buffer: Buffer.from(''),
            fieldname: 'face_identity',
            originalname: 'face_identity.jpg',
            mimetype: 'image/jpeg',
            size: 1000,
        },
    ]
    const user: Partial<User> = {
        id: '123',
        is_verified: false,
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail').withExactArgs({ id: user.id }).resolves(user);
    const doOCR = t.context.sandbox.mock(aiProvider).expects('doOcr').withExactArgs(files[0]).resolves(JSON.stringify({
        nik: '1234567890',
        nama: 'Test User'
    }));
    const uploadFace = t.context.sandbox.mock(fileService).expects('upload').withExactArgs([files[1]], {
            bucket_name: 'image-bucket',
            folder: `face-identity/${user.id}`,
            filename: `${files[1].originalname}`
        }, user.id as string, 'face-identity').resolves('face_identity.jpg');
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').withExactArgs({ id: user.id }, {
            is_verified: true,
            card_no: '1234567890',
            name: 'Test User'
        }).resolves(user);

    await verificationService.verifyUser(files, user.id as string);
    t.true(findUser.calledOnce);
    t.true(doOCR.calledOnce);
    t.true(uploadFace.calledOnce);
    t.true(updateUser.calledOnce);
});

test.serial('[VerificationService] OCR verification - case user already verified', async (t: any): Promise<void> => {
    const files: Files[] = [
        {
            buffer: Buffer.from(''),
            fieldname: 'card_identity',
            originalname: 'card_identity.jpg',
            mimetype: 'image/jpeg',
            size: 1000,
        },
        {
            buffer: Buffer.from(''),
            fieldname: 'face_identity',
            originalname: 'face_identity.jpg',
            mimetype: 'image/jpeg',
            size: 1000,
        },
    ]
    const user: Partial<User> = {
        id: '321',
        is_verified: true,
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail').withExactArgs({ id: user.id }).resolves(user);
    const doOCR = t.context.sandbox.mock(aiProvider).expects('doOcr').withExactArgs(files[0]).resolves(JSON.stringify({
        nik: '1234567890',
        nama: 'Test User'
    }));
    const uploadFace = t.context.sandbox.mock(fileService).expects('upload').withExactArgs([files[1]], {
            bucket_name: 'image-bucket',
            folder: `face-identity/${user.id}`,
            filename: `${files[1].originalname}`
        }, user.id as string, 'face-identity').resolves('face_identity.jpg');
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').withExactArgs({ id: user.id }, {
            is_verified: true,
            card_no: '1234567890',
            name: 'Test User'
        }).resolves(user);

    await verificationService.verifyUser(files, user.id as string)
    .catch((err) => {
        t.is(err.code, 'USER_ALREADY_VERIFIED');
    })
    t.true(findUser.calledOnce);
    t.false(doOCR.calledOnce);
    t.false(uploadFace.calledOnce);
    t.false(updateUser.calledOnce);
});

test.serial('[VerificationService] OCR verification - case identity card not exist', async (t: any): Promise<void> => {
    const files: Files[] = [
        {
            buffer: Buffer.from(''),
            fieldname: 'face_identity',
            originalname: 'face_identity.jpg',
            mimetype: 'image/jpeg',
            size: 1000,
        },
    ]
    const user: Partial<User> = {
        id: '123',
        is_verified: false,
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail').withExactArgs({ id: user.id }).resolves(user);
    const doOCR = t.context.sandbox.mock(aiProvider).expects('doOcr').withExactArgs(files[0]).resolves(JSON.stringify({
        nik: '1234567890',
        nama: 'Test User'
    }));
    const uploadFace = t.context.sandbox.mock(fileService).expects('upload').withExactArgs([files[1]], {
            bucket_name: 'image-bucket',
            folder: `face-identity/${user.id}`,
            filename: `${files[0].originalname}`
        }, user.id as string, 'face-identity').resolves('face_identity.jpg');
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').withExactArgs({ id: user.id }, {
            is_verified: true,
            card_no: '1234567890',
            name: 'Test User'
        }).resolves(user);

    await verificationService.verifyUser(files, user.id as string)
    .catch((err) => {
        t.is(err.code, 'IDENTITY_CARD_FILE_REQUIRED');
    })
    t.true(findUser.calledOnce);
    t.false(doOCR.calledOnce);
    t.false(uploadFace.calledOnce);
    t.false(updateUser.calledOnce);
});

test.serial('[VerificationService] OCR verification - case face identity not exist', async (t: any): Promise<void> => {
    const files: Files[] = [
        {
            buffer: Buffer.from(''),
            fieldname: 'card_identity',
            originalname: 'card_identity.jpg',
            mimetype: 'image/jpeg',
            size: 1000,
        },
    ]
    const user: Partial<User> = {
        id: '123',
        is_verified: false,
    };

    const findUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail').withExactArgs({ id: user.id }).resolves(user);
    const doOCR = t.context.sandbox.mock(aiProvider).expects('doOcr').withExactArgs(files[0]).resolves(JSON.stringify({
        nik: '1234567890',
        nama: 'Test User'
    }));
    const uploadFace = t.context.sandbox.mock(fileService).expects('upload').withExactArgs([files[1]], {
            bucket_name: 'image-bucket',
            folder: `face-identity/${user.id}`,
            filename: `${files[0].originalname}`
        }, user.id as string, 'face-identity').resolves('face_identity.jpg');
    const updateUser = t.context.sandbox.mock(userRepository).expects('update').withExactArgs({ id: user.id }, {
            is_verified: true,
            card_no: '1234567890',
            name: 'Test User'
        }).resolves(user);

    await verificationService.verifyUser(files, user.id as string)
    .catch((err) => {
        t.is(err.code, 'FACE_FILE_REQUIRED');
    })
    t.true(findUser.calledOnce);
    t.true(doOCR.calledOnce);
    t.false(uploadFace.calledOnce);
    t.false(updateUser.calledOnce);
});