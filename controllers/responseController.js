const { sequelize, Survey, Response, Answer } = require('../models');
const { buildAnswersSchema, answerKey } = require('../validators/responseValidator');
const { withOrderedQuestions } = require('../utils/queryHelpers');
const { runValidation } = require('../middleware/validate');
const AppError = require('../utils/AppError');

function findSurveyBySlug(slug) {
  return Survey.findOne({ where: { shareSlug: slug }, ...withOrderedQuestions() });
}

function buildAnswerRows(questions, answers, responseId) {
  const rows = [];

  questions.forEach((question) => {
    const answer = answers[answerKey(question)];

    if (answer === undefined || answer === '') {
      return;
    }

    if (question.type === 'multiple_choice') {
      answer.forEach((optionId) => {
        rows.push({ responseId, questionId: question.id, optionId });
      });
    } else if (question.type === 'single_choice') {
      rows.push({ responseId, questionId: question.id, optionId: answer });
    } else if (question.type === 'rating') {
      rows.push({ responseId, questionId: question.id, ratingValue: answer });
    } else {
      rows.push({ responseId, questionId: question.id, textValue: answer });
    }
  });

  return rows;
}

exports.showSurvey = async (req, res, next) => {
  try {
    const survey = await findSurveyBySlug(req.params.slug);

    if (!survey) {
      return next(new AppError('That survey link is not valid.', 404));
    }

    res.render('respond/show', { title: survey.title, survey, answers: {} });
  } catch (error) {
    next(error);
  }
};

exports.submit = async (req, res, next) => {
  try {
    const survey = await findSurveyBySlug(req.params.slug);

    if (!survey) {
      return next(new AppError('That survey link is not valid.', 404));
    }

    const answers = req.body.answers || {};

    if (survey.status !== 'published') {
      return res.status(403).render('respond/show', { title: survey.title, survey, answers });
    }

    const { value, errors } = runValidation(buildAnswersSchema(survey.questions), { answers });

    if (errors.length > 0) {
      return res.status(422).render('respond/show', {
        title: survey.title,
        survey,
        answers,
        error: errors
      });
    }

    await sequelize.transaction(async (transaction) => {
      const response = await Response.create(
        {
          surveyId: survey.id,
          submittedAt: new Date(),
          respondentIp: req.ip
        },
        { transaction }
      );

      const answerRows = buildAnswerRows(survey.questions, value.answers, response.id);

      if (answerRows.length > 0) {
        await Answer.bulkCreate(answerRows, { transaction });
      }
    });

    res.redirect(`/s/${survey.shareSlug}/thank-you`);
  } catch (err) {
    next(err);
  }
};

exports.showThankYou = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ where: { shareSlug: req.params.slug } });

    if (!survey) {
      return next(new AppError('That survey link is not valid.', 404));
    }

    res.render('respond/thankyou', { title: 'Thank You', survey });
  } catch (error) {
    next(error);
  }
};
