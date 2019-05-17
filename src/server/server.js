const express = require("express");
const path = require("path");
const logger = require("morgan");

const apiRouter = require("./routes/api");

const app = express();
require("./middleware/file-watch")(app);
const indexRouter = require("./routes/index")(app);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/", indexRouter);
app.use("/api", apiRouter);
app.use(express.static("./build/"));

module.exports = app;
