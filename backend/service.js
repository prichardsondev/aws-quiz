//preform logic -> send to db
const fs = module.require("fs");

const { db } = require("./db");

const service = {
    putQuestion: async (body,catagory) => {
        try {
            //reshape data
            db.post(body,catagory);
        } catch (err) { }
    },
    getQuestions: async (catagory) => {
        let questions = await db.get(catagory);
        return questions;
    },
    getCategories: async () => {
        try {
            const data = await db._getAll();
            return Object.keys(data.catagory || {});
        } catch (err) {
            console.log('service getCategories', err);
            return [];
        }
    }
};

module.exports = {
    service,
};