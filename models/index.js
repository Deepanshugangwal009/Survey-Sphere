const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');

const { sequelize } = require('../config/database');

const currentFile = path.basename(__filename);
const db = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== currentFile && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
