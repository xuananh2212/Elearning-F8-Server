"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuestionSet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      QuestionSet.belongsTo(models.Category, {
        foreignKey: "category_id",
      });
      QuestionSet.belongsTo(models.User, {
        foreignKey: "teacher_id",
      });

      QuestionSet.hasMany(models.Question, { foreignKey: "question_set_id" });
    }
  }
  QuestionSet.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      thumb: DataTypes.STRING,
      duration: DataTypes.INTEGER,
      total_questions: DataTypes.INTEGER,
      category_id: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      teacher_id: DataTypes.STRING,
    },
    {
      sequelize,
      createdAt: "created_at",
      updatedAt: "updated_at",
      modelName: "QuestionSet",
    }
  );
  return QuestionSet;
};
