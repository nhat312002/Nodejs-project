'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const posts = [];
    const postsCategories = [];
    
    // Helper random số nguyên
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // 1. BÀI VIẾT GỐC (ID: 1) - Status 2 (Approved)
    posts.push({
      title: "The first post ever",
      body: "The quick brown fox jumps over the lazy dog. This is the beginning of our blog journey.",
      user_id: 1,
      language_id: 1,
      status: 2, // Approved
      createdAt: new Date(),
      updatedAt: new Date()
    });
    postsCategories.push({ post_id: 1, category_id: 1, createdAt: new Date(), updatedAt: new Date() });
    postsCategories.push({ post_id: 1, category_id: 2, createdAt: new Date(), updatedAt: new Date() });

    // 2. TẠO 25 BÀI VIẾT APPROVED (ID: 2 -> 26)
    // Để test phân trang
    for (let i = 2; i <= 26; i++) {
      posts.push({
        title: `Approved Post #${i - 1}: ${generateRandomTitle()}`,
        body: generateRandomBody(),
        user_id: randomInt(1, 8), // Random user từ 1 đến 8
        language_id: randomInt(1, 3), // Random ngôn ngữ
        status: 2, // Approved
        createdAt: new Date(new Date().setDate(new Date().getDate() - randomInt(1, 30))), // Random ngày trong tháng qua
        updatedAt: new Date()
      });

      // Random Category cho bài viết này (Mỗi bài 1-2 category)
      const catId = randomInt(1, 9);
      postsCategories.push({ post_id: i, category_id: catId, createdAt: new Date(), updatedAt: new Date() });
      if (Math.random() > 0.5) {
        let catId2 = randomInt(1, 9);
        while(catId2 === catId) catId2 = randomInt(1, 9); // Tránh trùng
        postsCategories.push({ post_id: i, category_id: catId2, createdAt: new Date(), updatedAt: new Date() });
      }
    }

    // 3. TẠO 5 BÀI PENDING (ID: 27 -> 31)
    for (let i = 27; i <= 31; i++) {
      posts.push({
        title: `Pending Post #${i}: Waiting for review`,
        body: "This content is waiting for moderator approval...",
        user_id: randomInt(4, 8),
        language_id: 1,
        status: 1, // Pending
        createdAt: new Date(),
        updatedAt: new Date()
      });
      postsCategories.push({ post_id: i, category_id: 1, createdAt: new Date(), updatedAt: new Date() });
    }

    // 4. TẠO 3 BÀI REJECTED (ID: 32 -> 34)
    for (let i = 32; i <= 34; i++) {
      posts.push({
        title: `Rejected Post #${i}: Violated terms`,
        body: "This content contains inappropriate language.",
        user_id: randomInt(4, 8),
        language_id: 1,
        status: 3, // Rejected
        createdAt: new Date(),
        updatedAt: new Date()
      });
      postsCategories.push({ post_id: i, category_id: 3, createdAt: new Date(), updatedAt: new Date() });
    }

    await queryInterface.bulkInsert('Posts', posts, {});
    await queryInterface.bulkInsert('Posts_Categories', postsCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Posts_Categories', null, {});
    await queryInterface.bulkDelete('Posts', null, {});  
  }
};

// Hàm helper tạo nội dung giả
function generateRandomTitle() {
  const titles = [
    "How to master Angular in 2025",
    "Top 10 travel destinations in Vietnam",
    "Why TypeScript is better than JavaScript",
    "Delicious Pho recipe for beginners",
    "The future of AI and Machine Learning",
    "Healthy habits for a better life",
    "Understanding Sequelize Associations",
    "Morning routine of successful people",
    "Review: The latest iPhone 16",
    "Coding bootcamp vs Computer Science degree"
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRandomBody() {
  return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
}