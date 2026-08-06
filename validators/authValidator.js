const Joi = require('joi');

const validationOptions = {
  abortEarly: false,
  errors: { wrap: { label: false } }
};

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().label('Name'),
  email: Joi.string().trim().email().max(150).required().label('Email'),
  password: Joi.string().min(6).max(100).required().label('Password'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm password').messages({
    'any.only': 'Confirm password must match the password'
  })
}).prefs(validationOptions);

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().label('Email'),
  password: Joi.string().required().label('Password')
}).prefs(validationOptions);

module.exports = { registerSchema, loginSchema };
