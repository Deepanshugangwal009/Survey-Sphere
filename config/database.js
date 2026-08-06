const { Sequelize } = require('sequelize');

const config = require('./config');

const environment = process.env.NODE_ENV || 'development';
const settings = config[environment];

const sequelize = new Sequelize(settings.database, settings.username, settings.password, {
  host: settings.host,
  port: settings.port,
  dialect: settings.dialect,
  logging: settings.logging,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

function describeConnectionError(error) {
  const code = error.original ? error.original.code : null;

  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return 'Access denied. Check DB_USER and DB_PASSWORD in the .env file.';
  }
  if (code === 'ER_BAD_DB_ERROR') {
    return `The database "${settings.database}" does not exist. Create it before starting the app.`;
  }
  if (code === 'ECONNREFUSED') {
    return `No MySQL server is listening on ${settings.host}:${settings.port}. Start MySQL and try again.`;
  }
  if (code === 'ENOTFOUND') {
    return `The host "${settings.host}" could not be found. Check DB_HOST in the .env file.`;
  }

  return error.message;
}

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log(`Connected to the MySQL database "${settings.database}"`);
  } catch (error) {
    console.error('Could not connect to the database.');
    console.error(describeConnectionError(error));
    throw error;
  }
}

module.exports = { sequelize, connectDatabase };
