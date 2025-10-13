// const app = require("./index");

// const port = 3000;

// app.listen(port, () => {
//     console.log(`Running on http://localhost:${port}`);
// });
const { Sequelize } = require("sequelize");

// Khởi tạo kết nối
const sequelize = new Sequelize("blogdb", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// Hàm kiểm tra
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công!");
  } catch (error) {
    console.error("❌ Kết nối thất bại:", error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
