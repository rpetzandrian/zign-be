import { BaseModel } from "./base";

export interface File extends BaseModel {
    key: string;
    bucket_name: string;
    directory: string;
    file_url: string;
    file_name: string;
    file_size: number;
    mime_type: string;
}