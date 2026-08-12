const { Op } = require('sequelize');

const { sequelize, Question, QuestionOption } = require('../models');
const { questionSchema } = require('../validators/surveyValidator');
const { runValidation } = require('../middleware/validate');

function toArray(value) {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function readQuestionForm(body) {
  return {
    text: body.text,
    type: body.type,
    isRequired: body.isRequired,
    options: toArray(body.options).filter((option) => option.trim() !== ''),
    minValue: body.minValue,
    maxValue: body.maxValue
  };
}

function buildOptionRows(question, optionTexts, transaction) {
  return QuestionOption.bulkCreate(
    optionTexts.map((text, index) => ({
      questionId: question.id,
      text,
      position: index + 1
    })),
    { transaction }
  );
}

exports.showCreate = (req, res) => {
  res.render('questions/new', {
    title: 'Add Question',
    survey: req.survey,
    values: { type: 'single_choice', options: ['', ''] }
  });
};

exports.create = async (req, res, next) => {
  const values = readQuestionForm(req.body);
  const { value, errors } = runValidation(questionSchema, values);

  if (errors.length > 0) {
    return res.status(422).render('questions/new', {
      title: 'Add Question',
      survey: req.survey,
      error: errors,
      values
    });
  }

  try {
    await sequelize.transaction(async (transaction) => {
      const position = await Question.count({
        where: { surveyId: req.survey.id },
        transaction
      });

      const question = await Question.create(
        {
          surveyId: req.survey.id,
          text: value.text,
          type: value.type,
          isRequired: value.isRequired,
          minValue: value.minValue === undefined ? null : value.minValue,
          maxValue: value.maxValue === undefined ? null : value.maxValue,
          position: position + 1
        },
        { transaction }
      );

      if (value.options) {
        await buildOptionRows(question, value.options, transaction);
      }
    });

    req.flash('success', 'Question added.');
    res.redirect(`/surveys/${req.survey.id}`);
  } catch (err) {
    next(err);
  }
};

exports.showEdit = async (req, res, next) => {
  try {
    const options = await req.question.getOptions({ order: [['position', 'ASC']] });
    res.render('questions/edit', {
      title: 'Edit Question',
      survey: req.survey,
      question: req.question,
      values: {
        text: req.question.text,
        type: req.question.type,
        isRequired: req.question.isRequired,
        minValue: req.question.minValue,
        maxValue: req.question.maxValue,
        options: options.map((option) => option.text),
        optionIds: options.map((option) => String(option.id))
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  const submittedIds = toArray(req.body.optionIds);
  const values = readQuestionForm(req.body);
  const { value, errors } = runValidation(questionSchema, values);

  if (errors.length > 0) {
    return res.status(422).render('questions/edit', {
      title: 'Edit Question',
      survey: req.survey,
      question: req.question,
      error: errors,
      values: { ...values, optionIds: submittedIds }
    });
  }

  try {
    await sequelize.transaction(async (transaction) => {
      await req.question.update(
        {
          text: value.text,
          type: value.type,
          isRequired: value.isRequired,
          minValue: value.minValue === undefined ? null : value.minValue,
          maxValue: value.maxValue === undefined ? null : value.maxValue
        },
        { transaction }
      );

      const keptIds = [];

      if (value.options) {
        for (let index = 0; index < value.options.length; index += 1) {
          const optionId = submittedIds[index];
          const optionData = { text: value.options[index], position: index + 1 };

          if (optionId) {
            await QuestionOption.update(optionData, {
              where: { id: optionId, questionId: req.question.id },
              transaction
            });
            keptIds.push(Number(optionId));
          } else {
            const created = await QuestionOption.create(
              { ...optionData, questionId: req.question.id },
              { transaction }
            );
            keptIds.push(created.id);
          }
        }
      }

      await QuestionOption.destroy({
        where: {
          questionId: req.question.id,
          id: { [Op.notIn]: keptIds.length > 0 ? keptIds : [0] }
        },
        transaction
      });
    });

    req.flash('success', 'Question updated.');
    res.redirect(`/surveys/${req.survey.id}`);
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const removedPosition = req.question.position;
      await req.question.destroy({ transaction });

      await Question.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            surveyId: req.survey.id,
            position: { [Op.gt]: removedPosition }
          },
          transaction
        }
      );
    });

    req.flash('success', 'Question removed.');
    res.redirect(`/surveys/${req.survey.id}`);
  } catch (error) {
    next(error);
  }
};
