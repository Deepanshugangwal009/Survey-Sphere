exports.isAdmin = (req, res, next) => {
  if (res.locals.currentUser.role === 'admin') {
    return next();
  }

  req.flash('error', 'You do not have permission to open the admin area.');
  res.redirect('/surveys');
};
