const Joi = require('joi');

const validationOptions = {
  abortEarly: false,
  errors: { wrap: { label: false } }
};

const CHOICE_TYPES = ['single_choice', 'multiple_choice'];
const QUESTION_TYPES = [...CHOICE_TYPES, 'short_text', 'rating'];

const surveySchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required().label('Title'),
  description: Joi.string().trim().max(1000).allow('').label('Description')
}).prefs(validationOptions);

const questionSchema = Joi.object({
  text: Joi.string().trim().min(3).max(500).required().label('Question'),
  type: Joi.string().valid(...QUESTION_TYPES).required().label('Type'),
  isRequired: Joi.boolean().truthy('on').default(false).label('Required'),
  options: Joi.when('type', {
    is: Joi.valid(...CHOICE_TYPES),
    then: Joi.array()
      .items(Joi.string().trim().min(1).max(255).label('Option'))
      .min(2)
      .required()
      .label('Options'),
    otherwise: Joi.any().strip()
  }),
  minValue: Joi.when('type', {
    is: 'rating',
    then: Joi.number().integer().min(0).max(100).required().label('Minimum value'),
    otherwise: Joi.any().strip()
  }),
  maxValue: Joi.when('type', {
    is: 'rating',
    then: Joi.number()
      .integer()
      .greater(Joi.ref('minValue'))
      .max(100)
      .required()
      .label('Maximum value')
      .messages({ 'number.greater': 'Maximum value must be greater than the minimum value' }),
    otherwise: Joi.any().strip()
  })
}).prefs(validationOptions);

module.exports = { surveySchema, questionSchema };
