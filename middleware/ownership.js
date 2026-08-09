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
