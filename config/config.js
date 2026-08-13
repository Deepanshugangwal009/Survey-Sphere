require('dotenv').config();

function readConnectionUrl() {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL;

  if (!url) {
    return null;
  }

  const parsed = new URL(url);

  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 3306,
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace('/', ''),
    dialect: parsed.protocol.replace(':', '') === 'postgres' ? 'postgres' : 'mysql'
  };
}

const connectionUrl = readConnectionUrl();

const useSsl = String(process.env.DB_SSL).toLowerCase() === 'true';
const rejectUnauthorized = String(process.env.DB_SSL_REJECT_UNAUTHORIZED).toLowerCase() !== 'false';
const certificateAuthority = process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined;

const sslOption = useSsl
  ? { minVersion: 'TLSv1.2', rejectUnauthorized, ca: certificateAuthority }
  : undefined;

const databaseSettings = {
  username: connectionUrl ? connectionUrl.username : process.env.DB_USER,
  password: connectionUrl ? connectionUrl.password : process.env.DB_PASSWORD,
  database: connectionUrl ? connectionUrl.database : process.env.DB_NAME,
  host: connectionUrl ? connectionUrl.host : process.env.DB_HOST,
  port: connectionUrl ? connectionUrl.port : Number(process.env.DB_PORT) || 3306,
  dialect: connectionUrl ? connectionUrl.dialect : process.env.DB_DIALECT || 'mysql',
  dialectOptions: useSsl ? { ssl: sslOption } : {},
  logging: false
};

module.exports = {
  development: databaseSettings,
  test: databaseSettings,
  production: databaseSettings,
  sslOption
};
