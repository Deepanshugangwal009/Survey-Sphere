module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define(
    'Question',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      surveyId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('single_choice', 'multiple_choice', 'short_text', 'rating'),
        allowNull: false
      },
      isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      minValue: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      maxValue: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'questions',
      underscored: true
    }
  );

  return Question;
};
