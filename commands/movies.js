const axios = require("axios");
const FormData = require('form-data');
const path = require("path");
const { API_URL } = require("../config");

function escapeMarkdown(text) {
    return text
        .replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

module.exports = async function movies(chatId, userMessage, sendMessage) {
    const args = userMessage.replace('/movies', '').trim();
    if (!args) {
        sendMessage("⚠️ Search query cannot be empty!");
        return;
    }
    const url = `https://torrent-api-py-nx0x.onrender.com/api/v1/search?site=yts&query=${encodeURIComponent(args)}&limit=4`;
    sendMessage("🔎 Looking up your movie!");
    try {
        const data = (await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Telegram Bot)',
                'Content-Type': 'application/json'
            }
        })).data.data;
        if (!data) {
            sendMessage("⚠️ Cannot find the movie!");
            return;
        }
        console.log(data.data);
        data.forEach(async (entries) => {
            let imageUrl = entries.poster;
            let caption = `Name: ${escapeMarkdown(entries.name)}\nGenre: ${escapeMarkdown(entries.genre)}\nDate: ${escapeMarkdown(entries.date)}\nRating: ${escapeMarkdown(entries.rating)}\nRuntime: ${escapeMarkdown(entries.runtime)}\nDownloads:\n1. [${entries.torrents[0].quality}](${entries.torrents[0].torrent}) - ${escapeMarkdown(entries.torrents[0].size)}\n2. [${entries.torrents[1].quality}](${entries.torrents[1].torrent}) - ${escapeMarkdown(entries.torrents[1].size)}\n\nView more details [here](${entries.url})`;

            const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
            const fileName = path.basename(imageUrl.split('?')[0]);

            const form = new FormData();
            form.append('chat_id', chatId);
            form.append('caption', caption);
            form.append('parse_mode', 'MarkdownV2');
            form.append('photo', imageResponse.data, {
                filename: fileName
            });

            await axios.post(`${API_URL}/sendPhoto`, form, {
                headers: form.getHeaders()
            });
        });
    } catch (err) {
        console.error("❌ Error in moviesCommand:", err.response?.data || err.message);
        sendMessage(chatId, "❌ Couldn't fetch the movie. It might be an unsupported format or a Telegram error.");
    }
}

module.exports.syntax = "/movies [movie_name] - Use YTS Torrent API to get the movies.";