import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const API_URL = `https://api.telegram.org/bot${TOKEN}`;

export { TOKEN, API_URL };