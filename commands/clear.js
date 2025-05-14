import { clearConversation } from "../common/memory.js";

async function clear(chatId, text, sendMessage) {
    clearConversation(chatId);
    await sendMessage(chatId, "🧹 Your conversation has been cleared.");
}

clear.syntax = '/clear - Clears your chat history with AI';
export default clear;