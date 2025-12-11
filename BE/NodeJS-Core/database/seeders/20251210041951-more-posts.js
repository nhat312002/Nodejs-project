'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. CLEANUP OLD DATA
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await queryInterface.bulkDelete('Posts_Categories', null, {});
    await queryInterface.bulkDelete('Posts', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);

    const posts = [];
    const postsCategories = [];

    // --- CONFIG ---
    const FILLER_PER_LANG = 25; // 25 single posts per lang

    // ID Strategies
    const ID_START_EN = 1;
    const ID_START_VI = 200;
    const ID_START_ZH = 400;
    const ID_START_FILLER = 1000;

    // --- HELPERS ---
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const randomDate = () => {
      const date = new Date();
      date.setDate(date.getDate() - randomInt(0, 90)); // Past 3 months
      date.setHours(randomInt(0, 23), randomInt(0, 59));
      return date;
    };

    // Helper to pick N unique random categories (assuming Category IDs 1-9 exist)
    const pickRandomCategories = () => {
      const isMulti = Math.random() > 0.4; // 60% chance of being multi-category
      const count = isMulti ? randomInt(2, 3) : 1;

      const allCats = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const shuffled = allCats.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // --- 1. LINKED POSTS (TRANSLATIONS) - 15 SETS ---
    // These define explicit multi-categories based on topic
    // Map: 1:Tech, 2:Life, 3:News, 4:Music, 5:Travel, 6:Movie, 7:Car, 8:Science, 9:Sport
    const contentSets = [
      {
        catIds: [5, 2], // Travel + Life
        en: { title: "Must-visit hidden gems in Hanoi", body: "<p>Hanoi is not just about the Old Quarter. If you venture slightly further...</p><p>Check out West Lake during sunset.</p>" },
        vi: { title: "Những viên ngọc ẩn giấu tại Hà Nội", body: "<p>Hà Nội không chỉ có Phố Cổ. Nếu bạn chịu khó đi xa hơn một chút...</p><p>Hãy thử ngắm hoàng hôn Hồ Tây.</p>" },
        zh: { title: "河内必去的隐藏景点", body: "<p>河内不仅仅只有老城区。如果你稍微走远一点...</p><p>去西湖看日落吧。</p>" }
      },
      {
        catIds: [1, 8], // Tech + Science
        en: { title: "Why Angular Signals changes everything", body: "<p>Gone are the days of Zone.js performance issues. Signals bring granular reactivity...</p>" },
        vi: { title: "Tại sao Angular Signals thay đổi mọi thứ", body: "<p>Đã qua rồi cái thời lo lắng về hiệu năng của Zone.js. Signals mang lại khả năng phản ứng chi tiết...</p>" },
        zh: { title: "为什么 Angular Signals 改变了一切", body: "<p>Zone.js 性能问题的日子已经一去不复返了。Signals 带来了细粒度的反应性...</p>" }
      },
      {
        catIds: [2, 5], // Life + Travel
        en: { title: "The art of brewing Vietnamese Coffee", body: "<p>It requires patience. The drip filter (Phin) is the soul of this drink...</p>" },
        vi: { title: "Nghệ thuật pha cà phê phin Việt Nam", body: "<p>Nó đòi hỏi sự kiên nhẫn. Chiếc phin chính là linh hồn của thức uống này...</p>" },
        zh: { title: "越南咖啡冲泡的艺术", body: "<p>这需要耐心。滴漏过滤器（Phin）是这种饮料的灵魂...</p>" }
      },
      {
        catIds: [1, 8], // Tech + Science
        en: { title: "Is AI going to replace Junior Developers?", body: "<p>The short answer is no. But the workflow is changing drastically...</p>" },
        vi: { title: "Liệu AI có thay thế lập trình viên mới vào nghề?", body: "<p>Câu trả lời ngắn gọn là không. Nhưng quy trình làm việc đang thay đổi chóng mặt...</p>" },
        zh: { title: "人工智能会取代初级开发人员吗？", body: "<p>简短的回答是否定的。但工作流程正在发生巨大的变化...</p>" }
      },
      {
        catIds: [5], // Travel only
        en: { title: "A weekend in Da Nang: Perfect Itinerary", body: "<p>Start your morning at My Khe beach, then head to Ba Na Hills...</p>" },
        vi: { title: "Cuối tuần ở Đà Nẵng: Lịch trình hoàn hảo", body: "<p>Bắt đầu buổi sáng tại biển Mỹ Khê, sau đó đi Bà Nà Hills...</p>" },
        zh: { title: "岘港周末：完美行程", body: "<p>早上从美溪海滩开始，然后前往巴拿山...</p>" }
      },
      {
        catIds: [2], // Life only
        en: { title: "Minimalism: How to declutter your mind", body: "<p>It is not just about throwing away stuff. It is about prioritizing what matters.</p>" },
        vi: { title: "Chủ nghĩa tối giản: Cách dọn dẹp tâm trí", body: "<p>Không chỉ là vứt bỏ đồ đạc. Đó là việc ưu tiên những gì quan trọng.</p>" },
        zh: { title: "极简主义：如何清理你的思绪", body: "<p>这不仅仅是扔掉东西。这是关于优先考虑重要的事情。</p>" }
      },
      {
        catIds: [1], // Tech
        en: { title: "Top 5 VS Code extensions for 2025", body: "<p>1. Pretty TypeScript Errors.<br>2. Console Ninja.<br>...</p>" },
        vi: { title: "Top 5 tiện ích mở rộng VS Code năm 2025", body: "<p>1. Pretty TypeScript Errors.<br>2. Console Ninja.<br>...</p>" },
        zh: { title: "2025 年 5 大 VS Code 扩展", body: "<p>1. Pretty TypeScript Errors.<br>2. Console Ninja.<br>...</p>" }
      },
      {
        catIds: [2, 5], // Life + Travel
        en: { title: "Best Pho in Saigon vs Hanoi", body: "<p>The eternal debate. Saigon adds sugar and herbs. Hanoi keeps it pure and savory.</p>" },
        vi: { title: "Phở Sài Gòn và Phở Hà Nội: Đâu là chân ái?", body: "<p>Cuộc tranh luận bất tận. Sài Gòn thêm đường và rau thơm. Hà Nội giữ vị thanh và đậm đà.</p>" },
        zh: { title: "西贡河粉与河内河粉", body: "<p>永恒的争论。西贡加糖和香草。河内保持纯净和美味。</p>" }
      },
      {
        catIds: [1], // Tech
        en: { title: "Review: iPhone 16 Pro Max after 1 month", body: "<p>Battery life is insane. But is the new camera button useful?</p>" },
        vi: { title: "Đánh giá: iPhone 16 Pro Max sau 1 tháng", body: "<p>Thời lượng pin thật điên rồ. Nhưng nút camera mới có hữu dụng không?</p>" },
        zh: { title: "评测：iPhone 16 Pro Max 使用 1 个月后", body: "<p>电池寿命太疯狂了。但是新的相机按钮有用吗？</p>" }
      },
      {
        catIds: [5], // Travel
        en: { title: "Ha Giang Loop: A motorbike adventure", body: "<p>The most breathtaking views in Southeast Asia. Careful with the curves!</p>" },
        vi: { title: "Hà Giang Loop: Cuộc phiêu lưu bằng xe máy", body: "<p>Cảnh quan ngoạn mục nhất Đông Nam Á. Cẩn thận với những khúc cua!</p>" },
        zh: { title: "河江环线：摩托车冒险", body: "<p>东南亚最令人叹为观止的景色。小心弯道！</p>" }
      },
      {
        catIds: [1, 8], // Tech + Science
        en: { title: "Docker for Dummies: Explanation", body: "<p>Think of it like shipping containers for your code.</p>" },
        vi: { title: "Giải thích Docker cho người mới bắt đầu", body: "<p>Hãy nghĩ về nó như những container chuyển hàng cho mã nguồn của bạn.</p>" },
        zh: { title: "Docker 入门解释", body: "<p>把它想象成代码的集装箱。</p>" }
      },
      {
        catIds: [2], // Life
        en: { title: "Why I wake up at 5 AM", body: "<p>The silence of the morning gives me 2 hours of deep work.</p>" },
        vi: { title: "Tại sao tôi dậy lúc 5 giờ sáng", body: "<p>Sự tĩnh lặng của buổi sáng cho tôi 2 giờ làm việc sâu.</p>" },
        zh: { title: "我为什么早上 5 点起床", body: "<p>清晨的寂静给了我 2 小时的深度工作时间。</p>" }
      },
      {
        catIds: [5, 2], // Travel + Life
        en: { title: "Street Food Tour in Bangkok", body: "<p>Pad Thai is good, but have you tried Boat Noodles?</p>" },
        vi: { title: "Tour ẩm thực đường phố Bangkok", body: "<p>Pad Thai thì ngon đấy, nhưng bạn đã thử Mì Thuyền chưa?</p>" },
        zh: { title: "曼谷街头美食之旅", body: "<p>泰式炒河粉很好吃，但你尝过船面吗？</p>" }
      },
      {
        catIds: [8, 1], // Science + Tech
        en: { title: "SpaceX Starship: Mars colonization", body: "<p>Elon Musk's dream is getting closer to reality with the latest launch.</p>" },
        vi: { title: "SpaceX Starship: Thuộc địa hóa sao Hỏa", body: "<p>Giấc mơ của Elon Musk đang tiến gần hơn tới hiện thực với lần phóng mới nhất.</p>" },
        zh: { title: "SpaceX 星舰：火星殖民", body: "<p>随着最新的发射，埃隆马斯克的梦想越来越接近现实。</p>" }
      },
      {
        catIds: [1], // Tech
        en: { title: "Understanding Database Indexing", body: "<p>It is like the index at the back of a book. Without it, you scan every page.</p>" },
        vi: { title: "Hiểu về đánh chỉ mục (Index) trong Database", body: "<p>Nó giống như mục lục cuối sách. Không có nó, bạn phải lật từng trang.</p>" },
        zh: { title: "了解数据库索引", body: "<p>就像书后的索引一样。没有它，你必须浏览每一页。</p>" }
      }
    ];

    contentSets.forEach((set, index) => {
      const createTime = randomDate();
      const userId = randomInt(2, 5);

      // 1.1 ENGLISH
      const idEn = ID_START_EN + index;
      posts.push({
        id: idEn,
        title: set.en.title,
        body: set.en.body,
        // excerpt: null, // Let backend logic handle if needed, or auto-generated
        // url_thumbnail: null, 
        user_id: userId,
        language_id: 1,
        original_id: null,
        status: '2',
        createdAt: createTime,
        updatedAt: createTime
      });
      // Add multiple categories
      set.catIds.forEach(catId => {
        postsCategories.push({ post_id: idEn, category_id: catId, createdAt: createTime, updatedAt: createTime });
      });

      // 1.2 VIETNAMESE
      const idVi = ID_START_VI + index;
      posts.push({
        id: idVi,
        title: set.vi.title,
        body: set.vi.body,
        // excerpt: null,
        // url_thumbnail: null,
        user_id: userId,
        language_id: 2,
        original_id: idEn,
        status: '2',
        createdAt: createTime,
        updatedAt: createTime
      });
      set.catIds.forEach(catId => {
        postsCategories.push({ post_id: idVi, category_id: catId, createdAt: createTime, updatedAt: createTime });
      });

      // 1.3 CHINESE
      const idZh = ID_START_ZH + index;
      posts.push({
        id: idZh,
        title: set.zh.title,
        body: set.zh.body,
        // excerpt: null,
        // url_thumbnail: null,
        user_id: userId,
        language_id: 3,
        original_id: idEn,
        status: '2',
        createdAt: createTime,
        updatedAt: createTime
      });
      set.catIds.forEach(catId => {
        postsCategories.push({ post_id: idZh, category_id: catId, createdAt: createTime, updatedAt: createTime });
      });
    });

    // --- 2. FILLER POSTS (SINGLE LANGUAGE, MIXED CATEGORIES) ---

    const subjects = {
      en: ["The Developer", "My Cat", "Elon Musk", "A Junior Dev", "The Digital Nomad", "My Manager"],
      vi: ["Lập Trình Viên", "Con Mèo Của Tôi", "Elon Musk", "Lập Trình Viên Mới", "Digital Nomad", "Quản Lý Của Tôi"],
      zh: ["开发者", "我的猫", "埃隆·马斯克", "初级开发者", "数字游民", "我的经理"]
    };

    const verbs = {
      en: ["discovered", "ate", "deployed", "crashed", "visited", "wrote about"],
      vi: ["phát hiện", "ăn", "triển khai", "làm sập", "ghé thăm", "viết về"],
      zh: ["发现了", "吃了", "部署了", "弄崩了", "拜访了", "写了关于"]
    };

    const objects = {
      en: ["a bug", "a spicy noodle", "the production server", "a hidden beach", "the meaning of code", "React vs Angular"],
      vi: ["một con bug", "một tô mì cay", "server production", "một bãi biển bí mật", "ý nghĩa của code", "React vs Angular"],
      zh: ["一个 bug", "一碗辣面", "生产服务器", "一处隐藏的海滩", "代码的含义", "React 与 Angular"]
    };

    // langId: 1 = English, 2 = Vietnamese, 3 = Chinese
    const generateFiller = (langId) => {
      const lang = langId === 1 ? "en" : langId === 2 ? "vi" : "zh";

      const sub = subjects[lang][randomInt(0, subjects[lang].length - 1)];
      const verb = verbs[lang][randomInt(0, verbs[lang].length - 1)];
      const obj = objects[lang][randomInt(0, objects[lang].length - 1)];

      let title = "";
      let body = "";

      if (lang === "en") {
        title = `${sub} just ${verb} ${obj}`;
        body = `<p>This is a story about how ${sub} decided to ${verb} ${obj}. It was quite an experience.</p>`;
      }

      if (lang === "vi") {
        title = `Chuyện về ${sub} và ${obj}`;
        body = `<p>Đây là câu chuyện về việc ${sub} đã ${verb} ${obj} như thế nào. Thật là một trải nghiệm thú vị.</p>`;
      }

      if (lang === "zh") {
        title = `关于 ${sub} 和 ${obj} 的故事`;
        body = `<p>这是一个关于 ${sub} 如何 ${verb} ${obj} 的故事。这是一次非常有趣的经历。</p>`;
      }

      return { title, body };
    };


    let fillerIdCounter = ID_START_FILLER;

    [1, 2, 3].forEach(langId => {
      for (let i = 0; i < FILLER_PER_LANG; i++) {
        const content = generateFiller(langId);
        const createTime = randomDate();

        posts.push({
          id: fillerIdCounter,
          title: content.title,
          body: content.body,
          // excerpt: null,
          // url_thumbnail: null,
          user_id: randomInt(1, 8), // Ensure Users 1-8 exist
          language_id: langId,
          original_id: null,
          status: '2',
          createdAt: createTime,
          updatedAt: createTime
        });

        // Add 1 to 3 random categories per post
        const randomCats = pickRandomCategories();
        randomCats.forEach(catId => {
          postsCategories.push({ post_id: fillerIdCounter, category_id: catId, createdAt: createTime, updatedAt: createTime });
        });

        fillerIdCounter++;
      }
    });

    // 3. EXECUTE
    await queryInterface.bulkInsert('Posts', posts, {});
    await queryInterface.bulkInsert('Posts_Categories', postsCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await queryInterface.bulkDelete('Posts_Categories', null, {});
    await queryInterface.bulkDelete('Posts', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  }
};