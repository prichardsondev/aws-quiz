const { json } = require("express");
const fs = require("fs");

const db = {

    get: async (catagory) => {
        try {
            const data = await getJsonFile('./services.json');
            let ret = data.catagory[catagory];
            return ret;
        }
        catch (err) {
            console.log(`db: ${err}`);
            return { "error": err };
        }
    },
    post: async (body, catagory) => {
        //update to call getJsonFile()
        fs.readFile('./services.json', "utf8", (err, data) => {
            let cat = JSON.parse(data);
            cat.catagory[catagory].push(body);
            fs.writeFileSync("./services.json", JSON.stringify(cat,null,4));
        });
    }
};

// helper to expose full json for services
db._getAll = async () => {
    try {
        const data = await getJsonFile('./services.json');
        return data;
    } catch (err) {
        console.log('db._getAll', err);
        return {};
    }
};

module.exports = {
    db,
};

const getJsonFile = (filePath, encoding = 'utf8') => (
    new Promise((resolve, reject) => {
        fs.readFile(filePath, encoding, (err, contents) => {
            if (err) {
                return reject(err);
            }
            resolve(contents);
        });
    })
        .then(JSON.parse)
);


/*
    get: async (catagory, id) => {
        try {
            const data = await getJsonFile('./services.json');
            console.log("data", data);
            let ret = data.catagory[catagory].find(o => o.id = id);
            console.log("db:", ret);
            return ret;
        }
        catch (err) {
            console.log(`db: ${err}`);
            return { "error": err };
        }
    },
*/