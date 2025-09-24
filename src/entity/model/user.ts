import { BaseModel } from "./base";

export interface User extends BaseModel {
    name: string;
    email: string;
    password: string;
    role: string;
}