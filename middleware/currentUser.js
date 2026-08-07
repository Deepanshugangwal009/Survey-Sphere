const { User } = require('../models');

module.exports = async (req, res, next) => {
  res.locals.currentUser = null;

  if (!req.session.userId) {
    return next();
  }

  try {
    const user = await User.findByPk(req.session.userId);

    if (user) {
      res.locals.currentUser = user;
    } else {
      delete req.session.userId;
    }

    next();
  } catch (error) {
    next(error);
  }
};
