const { sequelize, Survey, Response, Answer } = require('../models');
const { buildAnswersSchema, answerKey } = require('../validators/responseValidator');
const { withOrderedQuestions } = require('../utils/queryHelpers');

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
      req.flash('error', 'That survey link is not valid.');
      return res.redirect('/');
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
      req.flash('error', 'That survey link is not valid.');
      return res.redirect('/');
    }

    const answers = req.body.answers || {};

    if (survey.status !== 'published') {
      return res.status(403).render('respond/show', { title: survey.title, survey, answers });
    }

    const { error, value } = buildAnswersSchema(survey.questions).validate({ answers });

    if (error) {
      return res.status(422).render('respond/show', {
        title: survey.title,
        survey,
        answers,
        error: error.details.map((detail) => detail.message)
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
      req.flash('error', 'That survey link is not valid.');
      return res.redirect('/');
    }

    res.render('respond/thankyou', { title: 'Thank You', survey });
  } catch (error) {
    next(error);
  }
};
