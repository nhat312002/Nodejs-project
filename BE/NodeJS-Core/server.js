const app = require("./index");

const { Sequelize } = require("sequelize");

const { db } = require("models");

const port = 3000;

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
