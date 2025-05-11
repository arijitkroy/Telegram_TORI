const axios = require("axios");
const FormData = require('form-data');
const path = require("path");
const { API_URL } = require("../config");

module.exports = async function movies(chatId, userMessage, sendMessage) {
    const args = userMessage.replace('/movies', '').trim();
    const url = `https://torrent-api-py-nx0x.onrender.com/api/v1/search?site=yts&query=${encodeURIComponent(args)}&limit=4`;
    await sendMessage('🔎 Looking up your movie!');
    try {
        const data = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Telegram Bot)',
                'Content-Type': 'application/json'
            }
        });
        if (!data) {
            sendMessage("⚠️ Cannot find the movie!");
            return;
        }
        data.forEach(async (entries) => {
            let imageUrl = entries.poster;
            let caption = `Name: ${entries.name}\nGenre: ${entries.genre}\nDate: ${entries.date}\nRating: ${entries.rating}\nRuntime: ${entries.runtime}\nDownloads:\n1. [${entries.torrents[0].quality}](${entries.torrents[0].torrent}) - ${entries.torrent[0].size}\n2. [${entries.torrents[1].quality}](${entries.torrents[1].torrent}) - ${entries.torrent[1].size}\n\nView more details [here](${entries.url})`;

            const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
            const fileName = path.basename(imageUrl.split('?')[0]);

            const form = new FormData();
            form.append('chat_id', chatId);
            form.append('caption', caption);
            form.append('photo', imageResponse.data, {
                filename: fileName
            });

            await axios.post(`${API_URL}/sendPhoto`, form, {
                headers: form.getHeaders()
            });
        });
    } catch (error) {
        console.error("❌ Error in moviesCommand:", err.response?.data || err.message);
        sendMessage(chatId, "❌ Couldn't fetch the movie. It might be an unsupported format or a Telegram error.");
    }
}

module.exports.syntax = "/movies [movie_name] - Use YTS Torrent API to get the movies.";