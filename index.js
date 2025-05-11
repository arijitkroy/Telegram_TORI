const express = require("express");
const axios = require("axios");
const { TOKEN, API_URL } = require("./config");
const handler = require("./utils/handler");
const callbackHandler = require("./utils/callback");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    const update = req.body;

    if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        const sendMessage = async (chatId, text) => {
            try {
                await axios.post(`${API_URL}/sendMessage`, {
                    chat_id: chatId,
                    text,
                });
            } catch (err) {
                console.error("Telegram sendMessage failed:", err.response?.data || err.message);
            }
        };

        await handler(chatId, text, sendMessage);
    }

    if (update.callback_query) {
        const chatId = update.callback_query.message.chat.id;
        const data = update.callback_query.data;
        await handler(chatId, null, sendMessage, data);
        return res.sendStatus(200);
    }

    res.sendStatus(200);
});

app.get("/", async (req, res) => {
    try {
        const webhookUrl = `https://${req.get("host")}/webhook/${TOKEN}`;
        console.log("Setting webhook to:", webhookUrl);

        const response = await axios.get(`${API_URL}/setWebhook`, {
            params: { url: webhookUrl }
        });

        res.send("Webhook set successfully: " + JSON.stringify(response.data));
    } catch (err) {
        console.error("Error setting webhook:", err.response?.data || err.message);
        res.status(500).send("Error setting webhook: " + (err.response?.data?.description || err.message));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});