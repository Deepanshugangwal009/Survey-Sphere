module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define(
    'Survey',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'closed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      shareSlug: {
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: true
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'surveys',
      underscored: true
    }
  );

  return Survey;
};
