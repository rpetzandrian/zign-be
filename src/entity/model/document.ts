import { BaseModel } from "./base";

export interface Document extends BaseModel {
    user_id: string;
    signed_file_id: string;
    original_file_id: string;
    sign_id: string;
    status: string;
    metadata: string;
    cover_url: string;
}