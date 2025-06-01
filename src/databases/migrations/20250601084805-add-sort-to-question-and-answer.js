module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Answers", "sort", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Answers", "sort");
  },
};
