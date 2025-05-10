const express = require("express");
const axios = require("axios");
const { TOKEN, API_URL } = require("./config");
const handler = require("./utils/handler");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post(`/webhook/${TOKEN}`, async (req, res) => {
    const update = req.body;
    const message = update.message;
    if (!message || !message.text) return res.sendStatus(200);

    const chatId = message.chat.id;
    const text = message.text;

    const sendMessage = async (chatId, text) => {
        try {
            await axios.post(`${API_URL}/sendMessage`, {
                chat_id: chatId,
                text
            });
        } catch (err) {
            console.error("Telegram sendMessage failed:", err.response?.data || err.message);
        }
    };

    await handler(chatId, text, sendMessage);
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