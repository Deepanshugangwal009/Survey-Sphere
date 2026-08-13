require('dotenv').config();

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const { connectDatabase, databaseSettings, sslOption } = require('./config/database');
const currentUser = require('./middleware/currentUser');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const questionRoutes = require('./routes/questionRoutes');
const responseRoutes = require('./routes/responseRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function readSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (isProduction) {
    console.error('SESSION_SECRET must be set when NODE_ENV is production.');
    process.exit(1);
  }

  return 'local-development-session-secret';
}

const sessionSecret = readSessionSecret();

const sessionStore = new MySQLStore({
  host: databaseSettings.host,
  port: databaseSettings.port,
  user: databaseSettings.username,
  password: databaseSettings.password,
  database: databaseSettings.database,
  ssl: sslOption
});

sessionStore.on('error', (error) => {
  console.error('Session store error:', error.message);
});

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(
  session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(currentUser);

app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/surveys', surveyRoutes);
app.use('/', questionRoutes);
app.use('/s', responseRoutes);
app.use('/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch {
    process.exit(1);
  }
}

startServer();
