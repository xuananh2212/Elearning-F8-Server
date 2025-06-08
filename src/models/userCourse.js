"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UsersCourses extends Model {
    static associate(models) {
      // Liên kết với bảng Users
      UsersCourses.belongsTo(models.User, {
        foreignKey: "user_id",
      });

      // Liên kết với bảng Courses
      UsersCourses.belongsTo(models.Course, {
        foreignKey: "course_id",
      });
    }
  }

  UsersCourses.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_pay: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order_code: {
        type: DataTypes.STRING,
      },
      payment_status: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "UsersCourses",
      tableName: "UsersCourses",
      underscored: true, // dùng snake_case trong DB
      timestamps: true, // tự động dùng created_at & updated_at
    }
  );

  return UsersCourses;
};
