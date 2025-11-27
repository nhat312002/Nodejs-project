'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const comments = [];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const commentContents = [
      "Great article!", "Thanks for sharing.", "Very helpful.", 
      "I disagree with point 2.", "Awesome!", "Can you explain more?", 
      "Looking forward to the next post.", "Interesting perspective."
    ];

    // Tạo comment thủ công ban đầu
    comments.push({ user_id: 2, content: "Nice post!", post_id: 1, parent_id: null, createdAt: new Date(), updatedAt: new Date() });
    comments.push({ user_id: 1, content: "Thanks!", post_id: 1, parent_id: 1, createdAt: new Date(), updatedAt: new Date() });

    // Tạo thêm 40 comment ngẫu nhiên rải rác vào các bài viết Approved (ID 1 -> 26)
    for (let i = 0; i < 40; i++) {
      const postId = randomInt(1, 26); // Chỉ comment vào bài đã approved
      comments.push({
        user_id: randomInt(1, 8),
        content: commentContents[randomInt(0, commentContents.length - 1)],
        post_id: postId,
        parent_id: null, // Comment cấp 1
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Comments', comments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Comments', null, {});
  }
};