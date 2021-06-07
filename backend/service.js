//preform logic -> send to db
var fs = module.require("fs");

const { db } = require("./db");

const service = {
    putQuestion: async (body,catagory) => {
        try {
            //reshape data
            db.post(body,catagory);
        } catch (err) { }
    },
    getQuestions: async (catagory) => {
        //reshape data
        let questions = await db.get(catagory);
        return questions;
    },
};

module.exports = {
    service,
};