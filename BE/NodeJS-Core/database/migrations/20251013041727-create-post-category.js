"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Post_Category", {
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Post",
          key: "id",
        },
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Category",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.addConstraint("Post_Category", {
      fields: ["post_id", "category_id"],
      type: "primary key",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Post_Category");
  },
};
