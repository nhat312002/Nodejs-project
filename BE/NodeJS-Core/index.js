require("dotenv").config({
  path: "./.env",
});
const path = require("path");
require("rootpath")();
const express = require("express");
const bodyParser = require("body-parser");
const router = require("routes/api");
const cors = require("cors");
const { swaggerUIServe, swaggerUISetup } = require("kernels/api-docs");

const app = express();
app.disable("x-powered-by");

app.use(cors());

app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api-docs", swaggerUIServe, swaggerUISetup);
app.use("/public", express.static("public"));
app.use("/", router);

module.exports = app;
