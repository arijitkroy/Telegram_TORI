const axios = require('axios');
const FormData = require('form-data');
const { API_URL } = require("../config");
const path = require('path');
const fs = require('fs');
const { default: axiosRetry } = require('axios-retry');

axiosRetry(axios, { retries: 3 });

function escapeMarkdown(text) {
    return text
        .replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

module.exports = async function memeCommand(chatId, args, sendMessage) {
    const sub_reddit = args.replace('/meme', '').trim();
    const url = sub_reddit 
        ? `https://meme-api.com/gimme/${sub_reddit}` 
        : "https://meme-api.com/gimme";

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Telegram Bot)',
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;
        const nsfw = data.nsfw;
        const imageUrl = !nsfw ? data.url : null;

        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
            sendMessage(chatId, "⚠️ Couldn't load meme image. Try again.");
            return;
        }

        const caption = `${escapeMarkdown(data.title)}\n✉️ Subreddit: ${escapeMarkdown(data.subreddit)}\n👤 Author: ${escapeMarkdown(data.author)}\n🔗 [Post Link](${data.postLink})\n🗳 Upvotes: ${data.ups}`;

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

        console.log("✅ Meme sent successfully.");
    } catch (err) {
        console.error("❌ Error in memeCommand:", err.response?.data || err.message);
        sendMessage(chatId, "❌ Couldn't send the meme. It might be an unsupported format or a Telegram error.");
    }
};

module.exports.syntax = '/meme [subreddit] - Fetches a random meme from random subreddit if not provided';