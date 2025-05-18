"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 = student
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "role");
  },
};
