'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('Categories', [
      {
        name: "Tech",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Life",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Sports",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Business",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Travel",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { name: "Food", createdAt: new Date(), updatedAt: new Date() },
      { name: "Health", createdAt: new Date(), updatedAt: new Date() },
      { name: "Science", createdAt: new Date(), updatedAt: new Date() },
      { name: "Education", createdAt: new Date(), updatedAt: new Date() }
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
