export enum COMMON_ERRORS {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    SERVER_ERROR = 'InternalServerError',
    TOKEN_INVALID = 'TOKEN_INVALID',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
    NO_ACCESS = 'NO_ACCESS',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS'
}

export interface IObject<D = any> {
    [s: string]: D;
}

export interface ICustomError {
    message: string;
    name: string;
    http_status: number;
    code?: string;
    data?: IObject;
}

export interface ErrorResponse {
    error_name: string;
    error_message: string;
    error_code: string;
    error_data?: any;
}