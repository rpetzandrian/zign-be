export interface SignDocsDto {
    document_id: string;
    sign_id: string;
    metadata: {
        koor_x: number;
        koor_y: number;
        height: number;
        width: number;
        page: number;
    }
}
