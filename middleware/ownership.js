const { Survey, Question } = require('../models');

exports.loadOwnedSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      where: { id: req.params.id, userId: res.locals.currentUser.id }
    });

    if (!survey) {
      req.flash('error', 'That survey was not found.');
      return res.redirect('/surveys');
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
      req.flash('error', 'That question was not found.');
      return res.redirect('/surveys');
    }

    req.question = question;
    req.survey = question.Survey;
    next();
  } catch (error) {
    next(error);
  }
};
