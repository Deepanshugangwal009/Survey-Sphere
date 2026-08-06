const { UniqueConstraintError } = require('sequelize');

const { User } = require('../models');
const { registerSchema, loginSchema } = require('../validators/authValidator');

function getValidationErrors(error) {
  return error.details.map((detail) => detail.message);
}

exports.showRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', values: {} });
};

exports.register = async (req, res, next) => {
  const values = { name: req.body.name, email: req.body.email };
  const { error, value } = registerSchema.validate(req.body);
  let errors = error ? getValidationErrors(error) : [];

  if (errors.length === 0) {
    try {
      await User.create({
        name: value.name,
        email: value.email,
        password: value.password
      });
      req.flash('success', 'Your account has been created. Please log in.');
      return res.redirect('/login');
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        errors = ['That email address is already registered'];
      } else {
        return next(err);
      }
    }
  }

  res.status(422).render('auth/register', { title: 'Register', error: errors, values });
};

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', values: {} });
};

exports.login = async (req, res, next) => {
  const values = { email: req.body.email };
  const { error, value } = loginSchema.validate(req.body);
  let errors = error ? getValidationErrors(error) : [];

  if (errors.length === 0) {
    try {
      const user = await User.scope('withPassword').findOne({ where: { email: value.email } });

      if (user && (await user.matchesPassword(value.password))) {
        req.session.userId = user.id;
        req.flash('success', `Welcome back, ${user.name}`);
        return res.redirect('/');
      }

      errors = ['Invalid email or password'];
    } catch (err) {
      return next(err);
    }
  }

  res.status(422).render('auth/login', { title: 'Login', error: errors, values });
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
};
