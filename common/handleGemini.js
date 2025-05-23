import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    addUserMessage,
    addModelResponse,
    getConversation,
    trimConversation,
    initChat
} from "./memory.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a helpful assistant in a Telegram bot. Avoid unsupported formatting.",
});

export default async function handleGemini(chatId, userMessage, sendMessage) {
    initChat(chatId);

    if (typeof userMessage !== "string") {
        console.warn("Ignored non-string message from user:", userMessage);
        await sendMessage(chatId, "⚠️ Unsupported message format.");
        return;
    }

    addUserMessage(chatId, userMessage);
    trimConversation(chatId, 20);

    const history = getConversation(chatId);
    const chatSession = model.startChat({ history });

    try {
        const result = await chatSession.sendMessage(userMessage);
        const reply = result.response.text();

        addModelResponse(chatId, reply);
        await sendMessage(chatId, reply);
    } catch (error) {
        console.error("Gemini AI error:", error.message);
        await sendMessage(chatId, "❌ Failed to get a response from Gemini.");
    }
}