import test from 'ava';
import * as sinon from 'sinon';

import SignService from '../../src/service/sign_service';
import { FileService } from '../../src/service/file_service';
import SignRepository from '../../src/repository/sign_repository';
import { Files } from '../../src/entity/constant/file';

const signRepository = new SignRepository({} as any);
const fileService = new FileService({} as any, {} as any, {} as any);
const signService = new SignService(fileService, signRepository);

test.beforeEach('Initialize new sandbox before test', (t: any): any => {
    process.env.FEATURE_TURN_OFF_AI='false';
    process.env.FEATURE_TURN_OFF_FACE_RECOGNITION='false';
    process.env.IMAGE_BUCKET='image-bucket';
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always('Restore sandbox after each test', (t: any): any => {
    t.context.sandbox.restore();
});

test.serial('[SignService] Upload Speciment', async (t: any): Promise<any> => {
    const file: Files = {
        buffer: Buffer.from(''),
        fieldname: 'sign_specimen',
        originalname: 'sign_specimen.png',
        mimetype: 'image/png',
        size: 1000,
    }
    const userId = 'user-123';

    const uploadPublic = t.context.sandbox.mock(fileService).expects('uploadPublic').withExactArgs([file], {
        bucket_name: 'image-bucket',
        folder: `sign-specimen/${userId}`,
    }).resolves([{
        id: 'file-123',
        file_url: 'https://image-bucket.s3.amazonaws.com/sign-specimen/user-123/file-123.png',
    }]);
    
    const create = t.context.sandbox.mock(signRepository).expects('create').resolves({
        id: 'sign-123',
        user_id: userId,
        file_id: 'file-123',
        preview_url: 'https://image-bucket.s3.amazonaws.com/sign-specimen/user-123/file-123.png',
    });
    
    await signService.uploadSignSpecimen(file, userId);
    t.true(uploadPublic.calledOnce);
    t.true(create.calledOnce);
})

test.serial('[SignService] Get Speciment', async (t: any): Promise<any> => {
    const userId = 'user-123';
    const page = 1;
    const limit = 10;
    const signs = [{
        id: 'sign-123',
        user_id: userId,
        preview_url: 'https://image-bucket.s3.amazonaws.com/sign-specimen/user-123/file-123.png',
        created_at: new Date(),
    }];
    const data = {
            count_total_size: 10,
            count_total_page: 1,
            count_total: 1,
            previous_page: page > 1 ? page - 1 : null,
            next_page: page < 1 ? page + 1 : null,
            rows_data: {
                docs: signs
            }
        };

    const count = t.context.sandbox.mock(signRepository).expects('count').withExactArgs({
            user_id: userId
        }).resolves(10);
    const get = t.context.sandbox.mock(signRepository).expects('findAll').withExactArgs({ user_id : userId },
        {
            attributes : ['id' , 'user_id' , 'preview_url' , 'created_at'],
            page,
            limit
        }).resolves(signs);
    
    const result = await signService.getSignSpecimen(userId, page, limit);
    t.true(count.calledOnce);
    t.true(get.calledOnce);
    t.deepEqual(result, data);
})