import { endChat } from "../common/memory.js";

async function end_contact(chatId, text, sendMessage) {
    endChat(chatId);
    await sendMessage(chatId, "🛑 Chat ended.");
}

end_contact.syntax = '/end_contact - Ends the chat session';
export default end_contact;