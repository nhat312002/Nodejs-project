'use strict';

const { QueryInterface } = require('sequelize');

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
    await queryInterface.bulkInsert('Posts', [
      {
        title: "The first post ever",
        body: "The quick brown fox jumps over the lazy dog.",
        user_id: 1,
        language_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    await queryInterface.bulkInsert('Posts_Categories', [
      {
        post_id: 1,
        category_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        post_id: 1,
        category_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('Posts', null, {});  
    await queryInterface.bulkDelete('Posts_Categories', null, {});
  }
};
