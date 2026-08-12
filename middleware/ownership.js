const { Survey, Question } = require('../models');
const AppError = require('../utils/AppError');

exports.loadOwnedSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      where: { id: req.params.id, userId: res.locals.currentUser.id }
    });

    if (!survey) {
      return next(new AppError('That survey does not exist or does not belong to you.', 404));
    }

    req.survey = survey;
    next();
  } catch (error) {
    next(error);
  }
};

exports.requireDraftSurvey = (req, res, next) => {
  if (req.survey.status !== 'draft') {
    req.flash('error', 'Questions can only be changed while the survey is a draft.');
    return res.redirect(`/surveys/${req.survey.id}`);
  }

  next();
};

exports.loadOwnedQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Survey,
          required: true,
          where: { userId: res.locals.currentUser.id }
        }
      ]
    });

    if (!question) {
      return next(new AppError('That question does not exist or does not belong to you.', 404));
    }

    req.question = question;
    req.survey = question.Survey;
    next();
  } catch (error) {
    next(error);
  }
};
