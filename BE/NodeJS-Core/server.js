const app = require("./index");

const { Sequelize } = require("sequelize");
const { database } = require("./configs");
// Khởi tạo kết nối
// const sequelize = new Sequelize("blogdb", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
// });

const { db } = require("models");

const port = 3000;

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
