const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const getUpdates = require("./app");

app.get('/', (req, res) => {
    res.send("Bot is running!");
    getUpdates();
});

app.listen(PORT);