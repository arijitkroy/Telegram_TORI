const { GoogleGenerativeAI } = require("@google/generative-ai");
const { addUserMessage, addModelResponse, getConversation, trimConversation } = require("./memory");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a helpful assistant in a Telegram bot. Keep replies concise and avoid unsupported formatting.",
});

async function handleGemini(chatId, userMessage, sendMessage) {
    addUserMessage(chatId, userMessage);
    trimConversation(chatId, 20);
    const chatSession = model.startChat({
        history: getConversation(chatId),
    });

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