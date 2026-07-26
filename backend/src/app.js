const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const ErrorMiddleware = require("./middlewares/ErrorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", routes);

app.use(ErrorMiddleware);

module.exports = app;