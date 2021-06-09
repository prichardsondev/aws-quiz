const express = require("express");
const cors = require('cors')
const path = require("path");
const routes = require("./router");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

routes(app);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));