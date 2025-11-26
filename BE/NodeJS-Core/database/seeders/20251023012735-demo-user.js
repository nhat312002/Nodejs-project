'use strict';
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Mật khẩu chung cho tất cả user seed: "P@ssword123"
     * Thỏa mãn regex: 
     * - Tối thiểu 8 ký tự
     * - Ít nhất 1 hoa, 1 thường, 1 số
     * - 1 ký tự đặc biệt
     */
    const rawPassword = "P@ssword123";
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    await queryInterface.bulkInsert('Users', [
      {
        full_name: "John Doe",
        username: "johndoe123", // > 8 chars
        password: hashedPassword,
        role_id: 1, // User
        email: "jdoedoe@maill.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "Straw Berry",
        username: "strawberry_cake", // > 8 chars
        password: hashedPassword,
        role_id: 2, // Moderator
        email: "strwy12@maill.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "Pine Apple",
        username: "pineapple_pie", // > 8 chars
        password: hashedPassword,
        role_id: 3, // Admin
        email: "papple@example.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Các user thêm vào để viết bài
      {
        full_name: "Alice Wonderland",
        username: "alice_wonder", // 12 chars
        password: hashedPassword,
        role_id: 1,
        email: "alice@test.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "Bob The Builder",
        username: "bob_builder", // 11 chars
        password: hashedPassword,
        role_id: 1,
        email: "bob@test.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "Charlie Chaplin",
        username: "charlie_chaplin", // 15 chars
        password: hashedPassword,
        role_id: 1,
        email: "charlie@test.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "David Beckham",
        username: "david_beckham", // 13 chars
        password: hashedPassword,
        role_id: 1,
        email: "david@test.com",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: "Elon Musk",
        username: "elon_musk_x", // 11 chars
        password: hashedPassword,
        role_id: 1,
        email: "elon@test.com",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};