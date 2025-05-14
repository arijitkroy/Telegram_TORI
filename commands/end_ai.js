import { endGeminiSession } from '../common/memory.js';

async function end_ai(chatId, userMessage, sendMessage) {
    const ended = endGeminiSession(chatId);
    if (ended) {
        await sendMessage(chatId, "🛑 AI session ended. I will no longer respond until you start a new session.");
    } else {
        await sendMessage(chatId, "⚠️ No active AI session to end.");
    }
}

end_ai.syntax = "/end_ai - Stop chatting with AI.";
export default end_ai;
