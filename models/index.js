const { DataTypes } = require('sequelize');

const { sequelize } = require('../config/database');

const User = require('./User')(sequelize, DataTypes);
const Survey = require('./Survey')(sequelize, DataTypes);
const Question = require('./Question')(sequelize, DataTypes);
const QuestionOption = require('./QuestionOption')(sequelize, DataTypes);
const Response = require('./Response')(sequelize, DataTypes);
const Answer = require('./Answer')(sequelize, DataTypes);

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

module.exports = {
  sequelize,
  User,
  Survey,
  Question,
  QuestionOption,
  Response,
  Answer
};
