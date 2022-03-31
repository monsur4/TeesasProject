const db = require("./queries.js");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// GET request at root
app.get("/", (request, response) => {
  response.json({ info: "API, Teesas" });
});

app.post("/signUp", db.signUp);
app.post("/signIn", db.signIn);
app.get("/lessons", db.getLessons);

// listen on port
app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
