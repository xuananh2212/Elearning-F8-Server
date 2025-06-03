"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("quizResults", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      question_set_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      correct_answers: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      wrong_answers: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_questions: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      answers: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Optional: add foreign key constraints
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("quizResults");
  },
};
