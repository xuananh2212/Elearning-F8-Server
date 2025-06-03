"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QuizResult extends Model {
    static associate(models) {
      QuizResult.belongsTo(models.User, {
        foreignKey: "user_id",
      });
      QuizResult.belongsTo(models.QuestionSet, {
        foreignKey: "question_set_id",
      });
    }
  }

  QuizResult.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question_set_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      correct_answers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrong_answers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_questions: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      answers: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "QuizResult",
      tableName: "quizResults",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return QuizResult;
};
