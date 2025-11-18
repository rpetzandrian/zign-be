import { BaseModel } from "./base";

export interface Sign extends BaseModel {
    user_id: string;
    file_id: string;
    metadata: string;
    preview_url: string;
}