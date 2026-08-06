exports.showHome = (req, res) => {
  res.render('home/index', { title: 'Home' });
};

exports.showAbout = (req, res) => {
  res.render('home/about', { title: 'About' });
};

exports.showContact = (req, res) => {
  res.render('home/contact', { title: 'Contact' });
};
