require("dotenv").config({
  path: "./.env",
});
const path = require("path");
require("rootpath")();
const express = require("express");
const bodyParser = require("body-parser");
const router = require("routes/api");
const { swaggerUIServe, swaggerUISetup } = require("kernels/api-docs");

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
app.use("/", router);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api-docs", swaggerUIServe, swaggerUISetup);

module.exports = app;
