const express = require("express");
const path = require("path");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.static(path.join(__dirname, "../src")));

app.listen(4000, () => console.log("listening on port 4000"));

app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/public/views/index.html");
});

app.get("/files", async (req, res) => {
  const query = req.query.q;
  const url = `http://localhost:3000?q=${query}`;
  const { data } = await axios.get(url);
  fs.writeFileSync(`./data/${query}.json`, JSON.stringify(data));
});
