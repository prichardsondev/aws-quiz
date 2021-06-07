//preform logic -> send to db
var fs = module.require("fs");

const { db } = require("./db");

const service = {
    putQuestion: async (body,catagory) => {
        try {
            db.post(body,catagory);
        } catch (err) { }
    },
    getQuestions: async (catagory) => {
        let questions = await db.get(catagory);
        return questions;
    },
};

module.exports = {
    service,
};