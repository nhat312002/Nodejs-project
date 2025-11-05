'use strict';
const bcrypt = require("bcrypt");

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
    await queryInterface.bulkInsert('Users', [
      {
        full_name: "John Doe",
        username: "jdoe1112",
        password: bcrypt.hashSync("password", 10),
        role_id: "1",
        email: "jdoedoe@maill.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "Straw Berry",
        username: "strawberry_",
        password: bcrypt.hashSync("password", 10),
        role_id: "2",
        email: "strwy12@maill.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "Pine Apple",
        username: "pineapple",
        password: bcrypt.hashSync("password", 10),
        role_id: "3",
        email: "papple@example.com",
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
      queryInterface.bulkDelete('Users', null, {});
  }
};
