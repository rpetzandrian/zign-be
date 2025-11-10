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

export const VERIFY_OTP_SCHEMA = Joi.object({
    body: Joi.object({
        otp: Joi.string().required(),
        email: Joi.string().email().required(),
    })
})

export const RESEND_OTP_SCHEMA = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
    })
})

export const FORGOT_PASSWORD_SCHEMA = Joi.object({
    body: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            })
    })
});

export const RESET_PASSWORD_SCHEMA = Joi.object({
    body: Joi.object({
        password: Joi.string()
            .min(8)
            .regex(/[A-Z]/, 'uppercase')
            .regex(/[^a-zA-Z0-9]/, 'special character')
            .required(),
        confirm_password: Joi.string()
            .min(8)
            .regex(/[A-Z]/, 'uppercase')
            .regex(/[^a-zA-Z0-9]/, 'special character')
            .required()
            .valid(Joi.ref('password')),
        token: Joi.string().required(),
        otp_code: Joi.string().required()
    })
});