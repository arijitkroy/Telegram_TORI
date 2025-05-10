const { clearConversation } = require("../common/memory");

module.exports = async function(chatId, text, sendMessage) {
    clearConversation(chatId);
    await sendMessage(chatId, "🧹 Your conversation has been cleared.");
};

module.exports.syntax = '/clear - Clears your chat history with AI';