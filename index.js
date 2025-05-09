const axios = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const getUpdates = require("./app");

app.get('/', (req, res) => {
    res.send("Bot is running!");
});

// setInterval(() => {
//   axios.get(`https://telegram-tori.onrender.com/`).then(() => {
//     console.log("🔄 Self-ping to prevent sleep");
//   }).catch((err) => {
//     console.error("⚠️ Self-ping failed:", err.message);
//   });
// }, 1000 * 60 * 5);

getUpdates();
app.listen(PORT);