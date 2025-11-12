'use strict';

const { query } = require('express-validator');

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

    await queryInterface.bulkInsert('Languages', [
      {
        name: "English",
        locale: "en",
        url_flag: "flags/en.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Vietnamese",
        locale: "vi",
        url_flag: "flags/vi.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Chinese",
        locale: "cn",
        url_flag: "flags/cn.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
      {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('Languages', null, {});
  }
};
