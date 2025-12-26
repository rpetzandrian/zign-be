import test from 'ava';
import * as sinon from 'sinon';

import DocumentService from '../../src/service/document_service';
import { FileService } from '../../src/service/file_service';
import SignRepository from '../../src/repository/sign_repository';
import UserRepository from '../../src/repository/user_repository';
import DocumentRepository from '../../src/repository/document_repository';
import { PDFDocument } from 'pdf-lib';
import { DOCUMENT_STATUS } from '../../src/entity/constant/document';
import { format } from 'date-fns';

const userRepository = new UserRepository({} as any);
const signRepository = new SignRepository({} as any);
const fileService = new FileService({} as any, {} as any, {} as any);
const documentRepository = new DocumentRepository({} as any);
const documentService = new DocumentService(fileService, documentRepository, signRepository, userRepository);

test.beforeEach('Initialize new sandbox before test', (t: any): any => {
    t.context.sandbox = sinon.createSandbox();
});

test.afterEach.always('Restore sandbox after each test', (t: any): any => {
    t.context.sandbox.restore();
});

test.serial('[DocumentService] Sign Document - case success', async (t: any): Promise<any> => {
    const documentId = 'document-id';
    const userId = 'user-id';
    const signId = 'sign-id';

    // Create a real minimal PDF and Image buffer to satisfy pdf-lib
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([600, 800]);
    const pdfBytes = await pdfDoc.save();
    
    // A tiny valid PNG header buffer
    const pngBuffer = Buffer.from('\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n\x2e\xe4\x00\x00\x00\x00IEND\xaeB`\x82', 'binary');

    const getUser = t.context.sandbox.mock(userRepository).expects('findOneOrFail')
        .withExactArgs({ id: userId }, { attributes: ['id', 'is_verified'] }).resolves({ is_verified: true } as any);
    const getDocument = t.context.sandbox.mock(documentRepository).expects('findOneOrFail').withExactArgs({ id: documentId }).exactly(2).resolves({ id: documentId, original_file_id: 'document-file-id' } as any);
    const getSign = t.context.sandbox.mock(signRepository).expects('findOneOrFail')
        .withExactArgs({ id: signId }).resolves({ file_id: 'sign-file-id', id: signId } as any);
    const getFile = t.context.sandbox.mock(fileService);
    getFile.expects('getFile').withExactArgs('document-file-id').resolves({ Body: Buffer.from(pdfBytes) });
    getFile.expects('getFile').withExactArgs('sign-file-id').resolves({ Body: pngBuffer });
    const uploadFile = t.context.sandbox.mock(fileService).expects('upload').resolves([{ id: 'sign-file-id' }]);
    const updateDocument = t.context.sandbox.mock(documentRepository).expects('update').resolves({ id: documentId });

    await documentService.signDocument({ document_id: documentId, sign_id: signId, metadata: { height: 100, width: 100, page: 1, koor_x: 100, koor_y: 100 } } , userId)
    getFile.verify();
    t.true(getUser.calledOnce);
    t.true(getDocument.called);
    t.true(getSign.calledOnce);
    t.true(uploadFile.calledOnce);
    t.true(updateDocument.calledOnce);
});

test.serial('[DocumentService] Upload Document - case success', async (t: any): Promise<any> => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([600, 800]);
    const pdfBytes = await pdfDoc.save();

    const file = {
        buffer: Buffer.from(pdfBytes),
        mimetype: 'application/pdf',
        fieldname: 'files',
        originalname: 'test.pdf',
        size: pdfBytes.length,
        filename: 'test.pdf',
    } as any;

    const uploadDocs = t.context.sandbox.mock(fileService).expects('upload').resolves([{ id: 'document-file-id' }]);
    const uploadCover = t.context.sandbox.mock(fileService).expects('uploadPublic').resolves([{ id: 'document-file-id' }]);
    const createDocument = t.context.sandbox.mock(documentRepository).expects('create').resolves({ id: 'document-id' });

    await documentService.uploadDocument(file, 'user-id')
    t.true(uploadDocs.calledOnce);
    t.true(uploadCover.calledOnce);
    t.true(createDocument.calledOnce);
});

test.serial('[DocumentService] Get Document List - case success', async (t: any): Promise<any> => {
    const userId = 'user-123';
    const page = 1;
    const limit = 10;
    const docs = [{
        id: 'doc-123',
        user_id: userId,
        preview_url: 'https://example.com/preview.pdf',
        created_at: new Date(),
    }];
    const data = {
            count_total_size: 10,
            count_total_page: 1,
            count_total: 1,
            previous_page: page > 1 ? page - 1 : null,
            next_page: page < 1 ? page + 1 : null,
            rows_data: {
                docs
            }
        };

    const count = t.context.sandbox.mock(documentRepository).expects('count').withExactArgs({
            user_id: userId
        }).resolves(10);
    const get = t.context.sandbox.mock(documentRepository).expects('findAll').withExactArgs({ user_id : userId },
        {
            attributes : ['id', 'original_file_id', 'signed_file_id', 'user_id', 'cover_url', 'status' , 'created_at'],
            page,
            limit
        }).resolves(docs);

    const result = await documentService.getDocumentList(userId, page, limit)
    t.true(count.calledOnce);
    t.true(get.calledOnce);
    t.deepEqual(result, data);
});

test.serial('[DocumentService] Get Validity Document - case success', async (t: any): Promise<any> => {
    const documentId = 'doc-123';
    const userId = 'user-123';
    const coverUrl = 'https://example.com/cover.jpg';
    const metadata = {
        sign_at: new Date(),
        sign_by: userId,
        author: userId,
        creator: 'test',
        checksum: '1234567890',
    }

    const get = t.context.sandbox.mock(documentRepository).expects('findOneOrFail')
    .withExactArgs({ id: documentId }, { attributes: ['id', 'original_file_id', 'signed_file_id', 'user_id', 'status', 'metadata', 'cover_url'] }).resolves({ id: documentId, user_id: userId, cover_url: coverUrl, status: DOCUMENT_STATUS.SIGNED, metadata: JSON.stringify(metadata) } as any);

    const result = await documentService.validityCheckDocument(documentId)
    t.true(get.calledOnce);
    t.deepEqual(result, {
        is_valid: true,
        sign_at: format(new Date(metadata.sign_at), 'dd MMMM yyyy HH:mm:ss'),
        author: metadata.author,
        provider: metadata.creator,
        checksum: metadata.checksum,
        document_cover_url: coverUrl,
    });
});