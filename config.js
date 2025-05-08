require("dotenv").config();
const TOKEN = process.env.BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}`;
module.exports = {
    TOKEN,
    API_URL
};
