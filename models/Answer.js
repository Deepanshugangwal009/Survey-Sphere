module.exports = (sequelize, DataTypes) => {
  const Answer = sequelize.define(
    'Answer',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      responseId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      questionId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      optionId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
      },
      textValue: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ratingValue: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      tableName: 'answers',
      underscored: true
    }
  );

  return Answer;
};
