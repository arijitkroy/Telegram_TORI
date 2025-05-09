const { GoogleGenerativeAI } = require("@google/generative-ai");
const { addUserMessage, addModelResponse, getConversation, trimConversation, initChat } = require("./memory");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a helpful assistant in a Telegram bot. Keep replies concise and avoid unsupported formatting.",
});

async function handleGemini(chatId, userMessage, sendMessage) {
    initChat(chatId);

    if (typeof userMessage !== "string") {
        console.warn("Ignored non-string message from user:", userMessage);
        await sendMessage(chatId, "⚠️ Unsupported message format.");
        return;
    }

    addUserMessage(chatId, userMessage);
    trimConversation(chatId, 20);

    const rawHistory = getConversation(chatId);
    const history = rawHistory.filter(
        (entry) =>
            typeof entry === "object" &&
            (entry.role === "user" || entry.role === "model") &&
            Array.isArray(entry.parts) &&
            entry.parts.every((p) => typeof p === "string")
    );

    if (history.length !== rawHistory.length) {
        console.warn("Corrupted history filtered for chatId:", chatId);
    }

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

module.exports = handleGemini;