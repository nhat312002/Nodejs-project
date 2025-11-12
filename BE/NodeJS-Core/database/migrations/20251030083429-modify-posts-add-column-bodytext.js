'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // await queryInterface.addColumn('Posts', 'body_text', {
    //   type: Sequelize.TEXT('long'),
    //   allowNull: true,
    // });

    // const Post = queryInterface.sequelize.define('Post', {
    //   title: Sequelize.STRING,
    //   body_text: Sequelize.TEXT('long'),
    // }, { tableName: 'Posts', timestamps: false });

    // await Post.update(
    //   { body_text: Sequelize.col('body') },
    //   { where: {} }
    // );

    // await queryInterface.changeColumn('Posts', 'body_text', {
    //   type: Sequelize.TEXT('long'),
    //   allowNull: false, 
    // });

    // await queryInterface.addIndex('Posts', ['title', 'body_text'], {
    //     name: 'posts_title_body_fulltext_index',
    //     type: 'FULLTEXT'
    // });

    await queryInterface.addIndex('Posts', ['title', 'body'], {
        name: 'posts_title_body_fulltext_index',
        type: 'FULLTEXT'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('Posts', 'posts_title_body_fulltext_index');
    // await queryInterface.removeColumn('Posts', 'body_text', {});
  }
};
