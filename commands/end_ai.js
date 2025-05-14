import { isGeminiActive, endGeminiSession } from '../common/memory.js';

async function end_ai(chatId, userMessage, sendMessage) {
     if (!isGeminiActive(chatId)) {
        await sendMessage(chatId, "⚠️ No active AI session to end.");
        return;
    }
    endGeminiSession(chatId);
    await sendMessage(chatId, "🛑 Gemini AI session ended. Use /start_ai to start again.");
}

end_ai.syntax = "/end_ai - Stop chatting with AI.";
export default end_ai;
