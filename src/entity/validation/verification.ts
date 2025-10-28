import Joi from "joi";


export const UPLOAD_CARD = Joi.object({
    files: Joi.array().required()
})