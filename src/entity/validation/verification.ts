import Joi from "joi";


export const UPLOAD_CARD = Joi.object({
    files: Joi.array().required()
})

export const FACE_RECOGNITION = Joi.object({
    files: Joi.array().required(),
    body: Joi.object({
        longitude: Joi.string().required(),
        latitude: Joi.string().required()
    }).required()
})