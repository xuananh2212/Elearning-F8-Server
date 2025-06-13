"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Blacklists", "token", {
      type: Sequelize.TEXT,
      allowNull: true, // hoặc false nếu bạn muốn token là bắt buộc
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Blacklists", "token", {
      type: Sequelize.STRING,
      allowNull: true, // hoặc false nếu cột ban đầu là bắt buộc
    });
  },
};
