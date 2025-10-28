import Joi from "joi";

export const SIGN_DOCUMENT = Joi.object({
    body: Joi.object({
        document_id: Joi.string().guid().required(),
        sign_id: Joi.string().guid().required(),
        metadata: Joi.object({
            koor_x: Joi.number().required(),
            koor_y: Joi.number().required(),
            height: Joi.number().positive().required(),
            weight: Joi.number().positive().required()
        })
    })
})

export const UPLOAD_DOCUMENT = Joi.object({
    files: Joi.array().required()
})

export const PREVIEW_DOCUMENT = Joi.object({
    params: Joi.object({
        id: Joi.string().guid().required()
    }),
    query: Joi.object({
        type: Joi.string().optional().default('original')
    })
})