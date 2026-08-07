exports.isAuthenticated = (req, res, next) => {
  if (res.locals.currentUser) {
    return next();
  }

  req.flash('error', 'Please log in to continue.');
  res.redirect('/login');
};

exports.isGuest = (req, res, next) => {
  if (res.locals.currentUser) {
    return res.redirect('/');
  }

  next();
};
