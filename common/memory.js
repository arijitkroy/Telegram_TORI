const chatMemory = {};

function initChat(chatId) {
    if (!chatMemory[chatId]) {
        chatMemory[chatId] = [];
    }
}

function addUserMessage(chatId, text) {
    initChat(chatId);
    chatMemory[chatId].push({ role: "user", parts: [text] });
}

function addModelResponse(chatId, text) {
    initChat(chatId);
    chatMemory[chatId].push({ role: "model", parts: [text] });
}

function getConversation(chatId) {
    initChat(chatId);
    return chatMemory[chatId];
}

function trimConversation(chatId, limit = 20) {
    initChat(chatId);
    if (chatMemory[chatId].length > limit) {
        chatMemory[chatId] = chatMemory[chatId].slice(-limit);
    }
}

function clearConversation(chatId) {
    chatMemory[chatId] = [];
}

module.exports = {
    addUserMessage,
    addModelResponse,
    getConversation,
    trimConversation,
    clearConversation
};