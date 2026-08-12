const { sequelize, Survey, Question } = require('../models');
const { surveySchema } = require('../validators/surveyValidator');
const { withOrderedQuestions } = require('../utils/queryHelpers');
const { runValidation } = require('../middleware/validate');
const { generateUniqueSlug } = require('../utils/slug');

function buildShareUrl(req, survey) {
  if (!survey.shareSlug) {
    return null;
  }
  return `${req.protocol}://${req.get('host')}/s/${survey.shareSlug}`;
}

exports.index = async (req, res, next) => {
  try {
    const surveys = await Survey.findAll({
      where: { userId: res.locals.currentUser.id },
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM responses WHERE responses.survey_id = `Survey`.`id`)'
            ),
            'responseCount'
          ]
        ]
      },
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
  const { value, errors } = runValidation(surveySchema, values);

  if (errors.length > 0) {
    return res.status(422).render('surveys/new', {
      title: 'New Survey',
      error: errors,
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
    res.render('surveys/show', {
      title: survey.title,
      survey,
      shareUrl: buildShareUrl(req, survey)
    });
  } catch (error) {
    next(error);
  }
};

exports.showEdit = (req, res) => {
  res.render('surveys/edit', { title: 'Edit Survey', survey: req.survey, values: req.survey });
};

exports.update = async (req, res, next) => {
  const values = { title: req.body.title, description: req.body.description };
  const { value, errors } = runValidation(surveySchema, values);

  if (errors.length > 0) {
    return res.status(422).render('surveys/edit', {
      title: 'Edit Survey',
      error: errors,
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

exports.publish = async (req, res, next) => {
  const survey = req.survey;

  if (survey.status !== 'draft') {
    req.flash('error', 'Only a draft survey can be published.');
    return res.redirect(`/surveys/${survey.id}`);
  }

  try {
    const questionCount = await Question.count({ where: { surveyId: survey.id } });

    if (questionCount === 0) {
      req.flash('error', 'Add at least one question before publishing this survey.');
      return res.redirect(`/surveys/${survey.id}`);
    }

    const shareSlug = survey.shareSlug || (await generateUniqueSlug());
    await survey.update({
      status: 'published',
      shareSlug,
      publishedAt: new Date(),
      closedAt: null
    });

    req.flash('success', 'Survey published. Share the public link to start collecting responses.');
    res.redirect(`/surveys/${survey.id}`);
  } catch (error) {
    next(error);
  }
};

exports.close = async (req, res, next) => {
  const survey = req.survey;

  if (survey.status !== 'published') {
    req.flash('error', 'Only a published survey can be closed.');
    return res.redirect(`/surveys/${survey.id}`);
  }

  try {
    await survey.update({ status: 'closed', closedAt: new Date() });
    req.flash('success', 'Survey closed. It will not accept new responses.');
    res.redirect(`/surveys/${survey.id}`);
  } catch (error) {
    next(error);
  }
};

exports.reopen = async (req, res, next) => {
  const survey = req.survey;

  if (survey.status !== 'closed') {
    req.flash('error', 'Only a closed survey can be reopened.');
    return res.redirect(`/surveys/${survey.id}`);
  }

  try {
    await survey.update({ status: 'published', closedAt: null });
    req.flash('success', 'Survey reopened and accepting responses again.');
    res.redirect(`/surveys/${survey.id}`);
  } catch (error) {
    next(error);
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
