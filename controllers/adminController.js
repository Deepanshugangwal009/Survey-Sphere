const { sequelize, User, Survey, Response } = require('../models');
const AppError = require('../utils/AppError');

const PAGE_SIZE = 10;

function readPage(req) {
  return Math.max(1, Number(req.query.page) || 1);
}

function countPages(total) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

exports.showDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalSurveys, totalResponses] = await Promise.all([
      User.count(),
      Survey.count(),
      Response.count()
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalUsers,
      totalSurveys,
      totalResponses
    });
  } catch (error) {
    next(error);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const page = readPage(req);
    const { count, rows } = await User.findAndCountAll({
      attributes: {
        include: [
          [
            sequelize.literal('(SELECT COUNT(*) FROM surveys WHERE surveys.user_id = `User`.`id`)'),
            'surveyCount'
          ]
        ]
      },
      order: [['created_at', 'DESC']],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE
    });

    res.render('admin/users', {
      title: 'Manage Users',
      users: rows,
      page,
      totalPages: countPages(count),
      totalUsers: count
    });
  } catch (error) {
    next(error);
  }
};

exports.listSurveys = async (req, res, next) => {
  try {
    const page = readPage(req);
    const { count, rows } = await Survey.findAndCountAll({
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
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE
    });

    res.render('admin/surveys', {
      title: 'Manage Surveys',
      surveys: rows,
      page,
      totalPages: countPages(count),
      totalSurveys: count
    });
  } catch (error) {
    next(error);
  }
};

exports.destroyUser = async (req, res, next) => {
  try {
    if (Number(req.params.id) === res.locals.currentUser.id) {
      req.flash('error', 'You cannot delete your own admin account.');
      return res.redirect('/admin/users');
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new AppError('That user does not exist.', 404));
    }

    await user.destroy();
    req.flash('success', `${user.name} and all of their surveys have been deleted.`);
    res.redirect('/admin/users');
  } catch (error) {
    next(error);
  }
};

exports.destroySurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.id);

    if (!survey) {
      return next(new AppError('That survey does not exist.', 404));
    }

    await survey.destroy();
    req.flash('success', `"${survey.title}" has been deleted.`);
    res.redirect('/admin/surveys');
  } catch (error) {
    next(error);
  }
};
