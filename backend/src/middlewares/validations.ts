import { celebrate, Joi, Segments } from 'celebrate';

const imageSchema = Joi.object({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
});

const productIdSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
});

export const createProductValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: imageSchema.required(),
    category: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().min(0).allow(null),
  }),
});

export const updateProductValidation = celebrate({
  [Segments.PARAMS]: productIdSchema,
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30),
    image: imageSchema,
    category: Joi.string(),
    description: Joi.string().allow(''),
    price: Joi.number().min(0).allow(null),
  }),
});

export const productIdValidation = celebrate({
  [Segments.PARAMS]: productIdSchema,
});

export const createOrderValidation = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  }),
});

export const registerValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const loginValidation = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
});
