const express = require("express");
const cors = require('cors')
const path = require("path");
const routes = require("./router");

const app = express();

const corsOptions = { origin: ['https://awsquiz.raspberrynode.com', 'http://localhost:4000', 'https://awsquizapi.raspberrynode.com'], optionsSuccessStatus: 200 };
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

routes(app);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));