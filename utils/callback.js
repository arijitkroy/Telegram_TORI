const axios = require("axios");
const FormData = require("form-data");
const { Readable } = require("stream");
const { API_URL } = require("../config");

module.exports = async function callback(callbackQuery) {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;

    if (!data.startsWith("download|")) return;

    const [, torrentUrl, quality, movieName] = data.split("|");

    try {
        const torrentRes = await axios.get(torrentUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(torrentRes.data);
        const stream = Readable.from(buffer);
        const fileName = `${movieName}_[${quality}].torrent`;

        const form = new FormData();
        form.append("chat_id", chatId);
        form.append("document", stream, { filename: fileName });
        form.append("caption", `${quality} Torrent for ${movieName}`);
        form.append("parse_mode", "HTML");

        await axios.post(`${API_URL}/sendDocument`, form, {
            headers: form.getHeaders()
        });

        await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id,
            text: `📦 Sending ${quality} torrent for ${movieName}`,
            show_alert: false
        });
    } catch (err) {
        console.error("❌ Torrent download error:", err.message);
        await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id,
            text: `❌ Failed to fetch torrent.`,
            show_alert: true
        });
    }
};