module.exports = (sequelize, DataTypes) => {
  const Response = sequelize.define(
    'Response',
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
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      respondentIp: {
        type: DataTypes.STRING(45),
        allowNull: true
      }
    },
    {
      tableName: 'responses',
      underscored: true
    }
  );

  return Response;
};
