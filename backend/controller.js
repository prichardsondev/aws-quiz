//pull data from request -> validate -> send to service -> return response
//from service to view
const { service } = require("./service");

const controller = {
  putQuestion: async (req, res) => {
    try {
      let body = req.body;
      let catagory = req.params.catagory;
      //validate...
      if (body && catagory) {
        await service.putQuestion(body,catagory);
        res.sendStatus(201);
      } else res.sendStatus(404);
    } catch (err) {
      console.log("controller putPlaylist...", err.message);
      res.sendStatus(500);
    }
  },
  getQuestions: async (req, res) => {
    try {
      let {catagory} = req.params;
      let questions = await service.getQuestions(catagory);
      res.json(questions);
    } catch (err) {
      console.log("controller getQuestions...", err.message);
      res.sendStatus(500);
    }
  },
};

module.exports = {
  controller,
};