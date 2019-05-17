var express = require("express");
var router = express.Router();

module.exports = app => {
  /* GET home page. */
  router.get("/", function(req, res, next) {
    const { schemas } = app.locals; // get the schema from app
    res.render("index.pug", {
      schemas: JSON.stringify(schemas),
      defaultSchema: "Example"
    });
  });
  return router;
};
