"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Course, { foreignKey: "teacher_id" });
      User.hasMany(models.QuestionSet, { foreignKey: "teacher_id" });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.STRING,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      address: DataTypes.STRING,
      phone: DataTypes.STRING,
      avatar: DataTypes.STRING,
      role: DataTypes.INTEGER,
    },
    {
      sequelize,
      createdAt: "created_at",
      updatedAt: "updated_at",
      modelName: "User",
    }
  );
  return User;
};
