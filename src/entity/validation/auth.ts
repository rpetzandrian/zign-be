import Joi from "joi";


export const REGISTER_SCHEMA = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).regex(/[A-Z]/, 'uppercase')
        .regex(/[^a-zA-Z0-9]/, 'special character')
        .required(),
        confirm_password: Joi.string().min(8).regex(/[A-Z]/, 'uppercase')
        .regex(/[^a-zA-Z0-9]/, 'special character').required().valid(Joi.ref('password')),
        name: Joi.string().required(),
    })
})

export const LOGIN_SCHEMA = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).regex(/[A-Z]/, 'uppercase')
        .regex(/[^a-zA-Z0-9]/, 'special character')
        .required(),
    })
})