"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("UsersCourses", "order_code", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("UsersCourses", "payment_status", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // 0 = miễn phí
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("UsersCourses", "order_code");
    await queryInterface.removeColumn("UsersCourses", "payment_status");
  },
};
