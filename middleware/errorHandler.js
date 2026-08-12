const {
  ConnectionError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  ValidationError
} = require('sequelize');

const AppError = require('../utils/AppError');

function describeError(error) {
  if (error instanceof AppError) {
    return { status: error.status, message: error.message };
  }

  if (error instanceof UniqueConstraintError) {
    return { status: 422, message: 'That value is already in use. Please try a different one.' };
  }

  if (error instanceof ForeignKeyConstraintError) {
    return { status: 422, message: 'That action refers to a record that no longer exists.' };
  }

  if (error instanceof ValidationError) {
    return { status: 422, message: 'Some of the information you entered is not valid.' };
  }

  if (error instanceof ConnectionError) {
    return { status: 503, message: 'The database is not reachable right now. Please try again shortly.' };
  }

  return { status: 500, message: 'Something went wrong on our side. Please try again.' };
}

exports.notFound = (req, res, next) => {
  next(new AppError('The page you are looking for does not exist.', 404));
};

exports.errorHandler = (error, req, res, next) => {
  const { status, message } = describeError(error);

  if (status >= 500) {
    console.error(error);
  }

  res.status(status);

  if (status === 404) {
    return res.render('errors/404', { title: 'Page Not Found', message });
  }

  res.render('errors/500', { title: 'Something Went Wrong', status, message });
};
