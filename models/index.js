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

const { User, Survey, Question, QuestionOption, Response, Answer } = db;

User.hasMany(Survey, { foreignKey: 'userId' });
Survey.belongsTo(User, { as: 'owner', foreignKey: 'userId' });

Survey.hasMany(Question, { as: 'questions', foreignKey: 'surveyId', onDelete: 'CASCADE' });
Question.belongsTo(Survey, { foreignKey: 'surveyId' });

Question.hasMany(QuestionOption, { as: 'options', foreignKey: 'questionId', onDelete: 'CASCADE' });
QuestionOption.belongsTo(Question, { foreignKey: 'questionId' });

Survey.hasMany(Response, { as: 'responses', foreignKey: 'surveyId', onDelete: 'CASCADE' });
Response.belongsTo(Survey, { foreignKey: 'surveyId' });

Response.hasMany(Answer, { as: 'answers', foreignKey: 'responseId', onDelete: 'CASCADE' });
Answer.belongsTo(Response, { foreignKey: 'responseId' });

Answer.belongsTo(Question, { foreignKey: 'questionId' });
Answer.belongsTo(QuestionOption, { foreignKey: 'optionId' });

db.sequelize = sequelize;

module.exports = db;
