import axios, { AxiosInstance } from 'axios';
import { Agent } from 'http';
import FormData from 'form-data';

export class FacePlusProvider {
    private apiKey: string;
    private apiSecret: string;
    private caller: AxiosInstance;
    constructor({ apiKey, apiSecret, apiUrl }: { apiKey: string, apiSecret: string, apiUrl: string }) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.caller = axios.create({ baseURL: apiUrl, httpAgent: new Agent({ keepAlive: false }) })
    }

    public async compareFaces(faceToken1: string, faceToken2: string) {
        try {
            const formData = new FormData();
            formData.append('api_key', this.apiKey);
            formData.append('api_secret', this.apiSecret);
            formData.append('image_base64_1', faceToken1);
            formData.append('image_base64_2', faceToken2);

            const res = await this.caller({
                method: 'POST',
                url: '/v3/compare',
                data: formData,
                headers: formData.getHeaders(),
            })

            return res.data;
        } catch (error: any) {
            throw error;
        }
    }
}

export default FacePlusProvider;