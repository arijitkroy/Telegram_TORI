const axios = require("axios");
const { TOKEN, API_URL } = require("./config");
const handler = require("./utils/handler");
let offset = 0;

axios.get(`${API_URL}/deleteWebhook`)
    .then(() => console.log('✅ Webhook deleted'))
    .catch(err => console.error('Webhook delete error:', err.message));

async function sendMessage(chatId, text) {
    try {
        await axios.post(`${API_URL}/sendMessage`, {
            chat_id: chatId,
            text,
        });
    } catch (err) {
        console.error('sendMessage error:', err.message);
    }
}

module.exports = async function getUpdates() {
    try {
        const res = await axios.get(`${API_URL}/getUpdates`, {
            params: { offset, timeout: 30 }
        });
        for (const update of res.data.result) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text;
            if (!text) continue;
            await handler(chatId, text, sendMessage);
            offset = update.update_id + 1;
        }
    }
    catch (err) {
        console.error('getUpdates error:', err.message);
    }
    finally {
        setImmediate(getUpdates);
    }
}