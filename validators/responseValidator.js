const Joi = require('joi');

const validationOptions = {
  abortEarly: false,
  errors: { wrap: { label: false } }
};

function answerKey(question) {
  return `q${question.id}`;
}

function buildQuestionRule(question) {
  const optionIds = question.options.map((option) => option.id);
  let rule;

  if (question.type === 'single_choice') {
    rule = Joi.number().integer().valid(...optionIds);
  } else if (question.type === 'multiple_choice') {
    rule = Joi.array().items(Joi.number().integer().valid(...optionIds)).single();
  } else if (question.type === 'rating') {
    rule = Joi.number().integer().min(question.minValue).max(question.maxValue);
  } else {
    rule = Joi.string().trim().max(2000);
  }

  rule = rule.label(question.text);

  if (!question.isRequired) {
    return rule.allow('').optional();
  }

  if (question.type === 'multiple_choice') {
    return rule.min(1).required();
  }

  return rule.required();
}

function buildAnswersSchema(questions) {
  const answerRules = {};

  questions.forEach((question) => {
    answerRules[answerKey(question)] = buildQuestionRule(question);
  });

  return Joi.object({
    answers: Joi.object(answerRules).default({})
  }).prefs(validationOptions);
}

module.exports = { buildAnswersSchema, answerKey };
