import { BaseModel } from "./base";

export interface FileOwner extends BaseModel {
    file_id: string;
    user_id: string;
    type: string;
}