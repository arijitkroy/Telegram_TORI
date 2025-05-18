import axios from "axios";
import FormData from "form-data";
import { API_URL } from "../config.js";

async function image(chatId, userMessage, sendMessage) {
    try {
        const prompt = userMessage.replace('/image', '').trim();
        sendMessage(chatId, "⏱️ Generating image...");
        const response = await axios.post(
            `https://${process.env.IMAGE_API}/accounts/${process.env.ACCOUNT_ID}/ai/run/${process.env.IMAGE_MODEL}`,
            {
                prompt: prompt
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WORKERS_AI_API}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', Buffer.from(response.data), {
            filename: 'image.png',
            contentType: 'image/png'
        });
        await axios.post(`${API_URL}/sendPhoto`, form, {
            headers: form.getHeaders()
        });
    } catch (error) {
        console.error("Image generation failed:", error.response?.data?.toString() || error.message);
        await sendMessage(chatId, "Failed to generate image.");
    }
}

image.syntax = "/image [prompt] - Generates an image on the given prompt";
export default image;