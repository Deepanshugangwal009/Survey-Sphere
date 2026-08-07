module.exports = (sequelize, DataTypes) => {
  const QuestionOption = sequelize.define(
    'QuestionOption',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      questionId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      text: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'question_options',
      underscored: true
    }
  );

  return QuestionOption;
};
