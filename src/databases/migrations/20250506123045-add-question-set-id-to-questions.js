"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Questions", "question_set_id", {
      type: Sequelize.STRING,
      allowNull: true, // có thể đổi thành false nếu muốn bắt buộc
      references: {
        model: "QuestionSets", // chú ý tên bảng phải đúng với trong DB
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Questions", "question_set_id");
  },
};
