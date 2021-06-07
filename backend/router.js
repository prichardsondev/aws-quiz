"use strict";

const { controller } = require("./controller");

module.exports = (app) => {
  app.route("/learn/:catagory").get(controller.getQuestions);
  app.route("/learn/:catagory").post(controller.putQuestion);
};