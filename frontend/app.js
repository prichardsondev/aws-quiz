const express = require("express");
var cors = require('cors')
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(4000, () => console.log("Listening on http://localhost:4000/"));