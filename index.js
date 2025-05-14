import express from "express";
import axios from "axios";
import { TOKEN, API_URL } from "./config.js";
import handler, { initCommands } from "./utils/handler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    const update = req.body;

    const sendMessage = async (chatId, text, extra = {}) => {
        try {
            await axios.post(`${API_URL}/sendMessage`, {
                chat_id: chatId,
                text,
                ...extra
            });
        } catch (err) {
            console.error("Telegram sendMessage failed:", err.response?.data || err.message);
        }
    };

    if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || "";
        await handler(chatId, text, sendMessage);
    }
    else if (update.callback_query) {
        const chatId = update.callback_query.message.chat.id;
        const data = update.callback_query.data;
        await handler(chatId, null, sendMessage, data);
        return res.sendStatus(200);
    }

    res.sendStatus(200);
});

app.get("/", async (req, res) => {
    res.send("TORI is up and running!");
});

initCommands().then(async () => {
    const webhookUrl = `https://${process.env.RENDER_HOST}/webhook/${TOKEN}`;
    console.log("Setting webhook to:", webhookUrl);
    try {
        const response = await axios.get(`${API_URL}/setWebhook`, {
            params: { url: webhookUrl }
        });
        console.log("Webhook set successfully:", response.data);
    } catch (err) {
        console.error("Error setting webhook:", err.response?.data || err.message);
    } finally {
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    }
}).catch(err => {
    console.error("❌ Failed to initialize commands:", err.message);
    process.exit(1);
});