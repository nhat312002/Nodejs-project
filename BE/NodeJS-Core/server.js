const app = require("./index");

const { Sequelize } = require("sequelize");

// Khởi tạo kết nối
const sequelize = new Sequelize("blogdb", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

const port = 3000;

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
