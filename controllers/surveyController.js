const { Survey } = require('../models');
const { surveySchema } = require('../validators/surveyValidator');
const { withOrderedQuestions } = require('../utils/queryHelpers');

function getValidationErrors(error) {
  return error.details.map((detail) => detail.message);
}

exports.index = async (req, res, next) => {
  try {
    const surveys = await Survey.findAll({
      where: { userId: res.locals.currentUser.id },
      order: [['created_at', 'DESC']]
    });
    res.render('surveys/index', { title: 'My Surveys', surveys });
  } catch (error) {
    next(error);
  }
};

exports.showCreate = (req, res) => {
  res.render('surveys/new', { title: 'New Survey', values: {} });
};

exports.create = async (req, res, next) => {
  const values = { title: req.body.title, description: req.body.description };
  const { error, value } = surveySchema.validate(values);

  if (error) {
    return res.status(422).render('surveys/new', {
      title: 'New Survey',
      error: getValidationErrors(error),
      values
    });
  }

  try {
    const survey = await Survey.create({
      userId: res.locals.currentUser.id,
      title: value.title,
      description: value.description
    });
    req.flash('success', 'Survey created. You can add questions now.');
    res.redirect(`/surveys/${survey.id}`);
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.survey.id, withOrderedQuestions());
    res.render('surveys/show', { title: survey.title, survey });
  } catch (error) {
    next(error);
  }
};

exports.showEdit = (req, res) => {
  res.render('surveys/edit', { title: 'Edit Survey', survey: req.survey, values: req.survey });
};

exports.update = async (req, res, next) => {
  const values = { title: req.body.title, description: req.body.description };
  const { error, value } = surveySchema.validate(values);

  if (error) {
    return res.status(422).render('surveys/edit', {
      title: 'Edit Survey',
      error: getValidationErrors(error),
      survey: req.survey,
      values
    });
  }

  try {
    await req.survey.update({ title: value.title, description: value.description });
    req.flash('success', 'Survey updated.');
    res.redirect(`/surveys/${req.survey.id}`);
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await req.survey.destroy();
    req.flash('success', 'Survey deleted.');
    res.redirect('/surveys');
  } catch (error) {
    next(error);
  }
};
