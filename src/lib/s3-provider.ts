import { S3Client as S3,  GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, ListObjectsCommand,  PutObjectCommandInput, CompleteMultipartUploadCommandOutput, GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { GetObjectResponse, S3ListObjectRequestPayload, S3RequestPayload } from '../entity/constant/file';
import { GetObjectRequest, ListObjectsRequest } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'node:stream';



class S3Provider {
    static instance: S3 | null = null;

    public static initialize(): void {
        if (!S3Provider.instance) {
            S3Provider.instance = new S3({
                region: String(process.env.S3_REGION),
                endpoint: String(process.env.S3_ENDPOINT),
                credentials: {
                    accessKeyId: String(process.env.S3_ACCESS_KEY_ID),
                    secretAccessKey: String(process.env.S3_SECRET_ACCESS_KEY),
                },
                forcePathStyle: true
            });
        }
    }

    public static getInstance(): S3 {
        if (!S3Provider.instance) {
            throw new Error('Not initialize');
        }
        return S3Provider.instance;
    }

    public async upload(options: PutObjectCommandInput): Promise<CompleteMultipartUploadCommandOutput> {
        try {
            const instance = S3Provider.getInstance();
            const upload = new Upload({
                client: instance,
                params: {
                    Bucket: options.Bucket,
                    Key: options.Key,
                    Body: options.Body,
                    ContentType: options.ContentType,
                    ACL: options.ACL
                }
            });
            return upload.done();
        } catch (error) {
            throw error;
        }
    }

    public async get({ bucket, key }: S3RequestPayload): Promise<GetObjectResponse> {
        const instance = S3Provider.getInstance();
        const params: GetObjectRequest = {
            Bucket: bucket,
            Key: key,
        };
        const command = new GetObjectCommand(params);
        const result = await instance.send(command);

        return {
            Body: Buffer.from(await result.Body?.transformToByteArray() || []),
            ContentType: result.ContentType || 'application/octet-stream',
            ContentLength: result.ContentLength || 0,
            LastModified: result.LastModified,
            ETag: result.ETag || ''
        };
    }

    public async delete({ bucket, key }: S3RequestPayload): Promise<any> {
        const instance = S3Provider.getInstance();
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        });
        return instance.send(command);
    }

    public async getBucket(bucketName : string): Promise<any>{
        const instance = S3Provider.getInstance();
        const command = new HeadBucketCommand({Bucket: bucketName});
        return instance.send(command);
    }

    public async listObjects(data: S3ListObjectRequestPayload): Promise<any> {
        const { bucket, marker, prefix, max_keys } = data;
        const instance = S3Provider.getInstance();
        const params: ListObjectsRequest = {
            Bucket: bucket,
            Marker: marker,
            Prefix: prefix,
            MaxKeys: max_keys
        };
        const command = new ListObjectsCommand(params);
        return instance.send(command);
    }
}

export default S3Provider;
