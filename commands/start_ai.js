import { startGeminiSession } from '../common/memory.js';

async function start_ai(chatId, userMessage, sendMessage) {
    startGeminiSession(chatId);
    await sendMessage(chatId, "🤖 Gemini AI session started. Type your message below.");
}

start_ai.syntax = "/start_ai - Start chatting with AI.";
export default start_ai;