const axios = require("axios");
const FormData = require('form-data');
const path = require("path");
const { API_URL } = require("../config");

module.exports = async function movies(chatId, userMessage, sendMessage) {
    const args = userMessage.replace('/movies', '').trim();
    if (!args) {
        sendMessage(chatId, "⚠️ Search query cannot be empty!");
        return;
    }
    const url = `https://torrent-api-py-nx0x.onrender.com/api/v1/search?site=yts&query=${encodeURIComponent(args)}&limit=4`;
    sendMessage(chatId, "🔎 Looking up your movie!");
    try {
        const data = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Telegram Bot)',
                'Content-Type': 'application/json'
            }
        });
        if (!data) {
            sendMessage(chatId, "⚠️ Cannot find the movie!");
            return;
        }
        data.data.data.forEach(async (entries) => {
            let imageUrl = entries.poster;
            let caption = 
                `<b>Name:</b> ${entries.name}\n` +
                `<b>Genre:</b> ${entries.genre}\n` +
                `<b>Date:</b> ${entries.date}\n` +
                `<b>Rating:</b> ${entries.rating}\n` +
                `<b>Runtime:</b> ${entries.runtime}\n\n` +
                `<b>Downloads:</b>\n` +
                `${
                    entries.torrents.map((tor, id) => {
                        `${id}. <a href="${entries.torrents[0].torrent}">${entries.torrents[0].quality}</a> - ${entries.torrents[0].size}\n`;
                    })
                    }` +
                `\n<a href="${entries.url}">View more details</a>`;

            const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
            const fileName = path.basename(imageUrl.split('?')[0]);

            const form = new FormData();
            form.append('chat_id', chatId);
            form.append('caption', caption);
            form.append('parse_mode', 'HTML');
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