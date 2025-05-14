import {
    getChatIdByUsername,
    createChatBridge
} from "../common/memory.js";

async function start_contact(chatId, text, sendMessage) {
    const parts = text.split(" ");
    const username = parts[1]?.replace("@", "");

    if (!username) {
        await sendMessage(chatId, "⚠️ Usage: /contact @username");
        return;
    }

    const targetId = getChatIdByUsername(username);

    if (!targetId) {
        await sendMessage(chatId, "❌ That user hasn't started a chat with this bot yet.");
        return;
    }

    createChatBridge(chatId, targetId);
    await sendMessage(chatId, `📨 Contact request sent to @${username}.`);

    await sendMessage(targetId, `👋 @${text.split(" ")[0].slice(1)} wants to chat with you. Just reply to this message.`);
}

start_contact.syntax = "/contact @username — Initiate a chat with another user who has used the bot.";
export default start_contact;