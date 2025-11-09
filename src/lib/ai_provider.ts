import fs from "fs";
import OpenAI from "openai";
import path from "path";
import logger from "./logger";
import { InternalServerError } from "../base/http_error";
import { Files } from "../entity/constant/file";

export class AiProvider {
    static instance: OpenAI | null = null;

    static initialize() {
        if (!this.instance) {
            this.instance = new OpenAI({
                baseURL: process.env.OPENROUTER_BASE_URL,
                apiKey: process.env.OPENROUTER_API_KEY, 
            });
        }
    }

    public async doOcr(file: Files) {
        if (!AiProvider.instance) {
            throw new Error('AiProvider not initialized');
        }

        try {
            const instructions = fs.readFileSync(path.join(__dirname, '../data/ocr_prompt.txt'), 'utf-8');
            const base64Image = Buffer.from(file.buffer).toString('base64');
            const resp = await AiProvider.instance.chat.completions.create({
                model: process.env.OPENROUTER_MODEL as string,
                messages: [
                    {
                        role: "system",
                        content: instructions,
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${file.mimetype};base64,${base64Image}`
                                }
                            }
                        ],
                    },
                ],
                response_format: { type: 'json_object' }
            })

            return resp.choices[0].message.content;
        } catch (error) {
            logger.error('Error ocr process', error);
            throw new InternalServerError('Error ocr process');
        }
    }
}