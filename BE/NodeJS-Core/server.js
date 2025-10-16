const app = require("./index");

const { Sequelize } = require("sequelize");
<<<<<<< HEAD
const { database } = require("./configs");
// Khởi tạo kết nối
// const sequelize = new Sequelize("blogdb", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
// });
=======

const { db } = require("models");
>>>>>>> 1a81b0ab33b75d5980574e6faf051cf8e8146471

const port = 3000;

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
