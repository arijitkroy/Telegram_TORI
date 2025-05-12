import { clearConversation } from "../common/memory.js";

async function clearCommand(chatId, text, sendMessage) {
    clearConversation(chatId);
    await sendMessage(chatId, "🧹 Your conversation has been cleared.");
}

clearCommand.syntax = '/clear - Clears your chat history with AI';
export default clearCommand;