import axios from "axios";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";
import { API_URL } from "../config.js";

const movieCache = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendTorrent(chatId, movie, torrent) {
    const fileName = `${movie.name}_${torrent.quality}.torrent`.replace(/\s+/g, "_");
    const response = await axios.get(torrent.torrent, { responseType: 'arraybuffer' });

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("document", Buffer.from(response.data), {
        filename: fileName,
        contentType: "application/x-bittorrent"
    });
    form.append("caption", `🎬 ${movie.name}\n📥 ${torrent.quality} - ${torrent.size}`);
    form.append("parse_mode", "HTML");

    await axios.post(`${API_URL}/sendDocument`, form, {
        headers: form.getHeaders()
    });
}

async function movies(chatId, userMessage, sendMessage, callbackData = null) {
    if (callbackData) {
        if (callbackData.startsWith("download_")) {
            const index = parseInt(callbackData.split("_")[1]);
            const cached = movieCache.get(chatId);
            if (!cached || !cached[index]) return;

            const movie = cached[index];
            const torrents = movie.torrents;

            const buttons = torrents.map((tor, i) => [{
                text: `${tor.quality} [${tor.type}] - ${tor.size}`,
                callback_data: `torrent_${index}_${i}`
            }]);

            buttons.push([{ text: "🔙 Cancel", callback_data: "cancel" }]);

            await axios.post(`${API_URL}/sendMessage`, {
                chat_id: chatId,
                text: `🎬 <b>${movie.name}</b>\nSelect a quality to download:`,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: buttons }
            });

            return;
        }

        if (callbackData.startsWith("torrent_")) {
            const [_tag, index, tidx] = callbackData.split("_");
            const cached = movieCache.get(chatId);
            if (!cached || !cached[index]) return;

            const movie = cached[index];
            const torrent = movie.torrents[tidx];

            await sendTorrent(chatId, movie, torrent);
            return;
        }

        if (callbackData === "cancel") {
            await axios.post(`${API_URL}/sendMessage`, {
                chat_id: chatId,
                text: "❌ Cancelled.",
            });
            return;
        }

        return;
    }

    const args = userMessage.replace('/movies', '').trim();
    if (!args) {
        sendMessage(chatId, "⚠️ Search query cannot be empty!");
        return;
    }

    const url = `${process.env.API_HOST}/api/v1/search?site=yts&query=${encodeURIComponent(args)}&limit=4`;
    sendMessage(chatId, "🔎 Looking up your movie!");

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Telegram Bot)',
                'Content-Type': 'application/json'
            }
        });

        const results = response.data.data;
        if (!results || !results.length) {
            sendMessage(chatId, "⚠️ Cannot find the movie!");
            return;
        }

        movieCache.set(chatId, results);

        results.forEach(async (entry, index) => {
            if (!entry.name && !entry.imageUrl) return;
            const imageUrl = entry.poster;
            const caption =
                `<b>Name:</b> ${entry.name}\n` +
                `<b>Genre:</b> ${entry.genre}\n` +
                `<b>Date:</b> ${entry.date}\n` +
                `<b>Rating:</b> ${entry.rating}\n` +
                `<b>Runtime:</b> ${entry.runtime}`;

            const buttons = {
                inline_keyboard: [
                    [{ text: "📥 Download", callback_data: `download_${index}` }]
                ]
            };

            try {
                const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
                const fileName = path.basename(imageUrl.split('?')[0]);

                const form = new FormData();
                form.append('chat_id', chatId);
                form.append('caption', caption);
                form.append('parse_mode', 'HTML');
                form.append('photo', imageResponse.data, { filename: fileName });
                form.append('reply_markup', JSON.stringify(buttons));

                await axios.post(`${API_URL}/sendPhoto`, form, {
                    headers: form.getHeaders()
                });
            } catch (imageErr) {
                console.warn("⚠️ Failed to send photo, falling back to text:", imageErr.message);
                await axios.post(`${API_URL}/sendMessage`, {
                    chat_id: chatId,
                    text: caption,
                    parse_mode: "HTML",
                    reply_markup: buttons
                });
            }
        });

    } catch (err) {
        console.error("❌ Error in /movies:", err.response?.data || err.message);
        sendMessage(chatId, "❌ Couldn't fetch the movie. It might be an unsupported format or a Telegram error.");
    }
}

movies.syntax = "/movies [movie name] - Use YTS Torrent API to get the movies.";
movies.callback = true;
export default movies;