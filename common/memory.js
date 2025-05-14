const chatMemory = {};
const userStates = new Map();
const activeGeminiUsers = new Set();

function startGeminiSession(chatId) {
    activeGeminiUsers.add(chatId);
}

function endGeminiSession(chatId) {
    activeGeminiUsers.delete(chatId);
}

function isGeminiActive(chatId) {
    return activeGeminiUsers.has(chatId);
}

function initChat(chatId) {
    if (!chatMemory[chatId]) {
        chatMemory[chatId] = [];
    }
}

function addUserMessage(chatId, text) {
    chatMemory[chatId].push({
        role: "user",
        parts: [{ text }]
    });
}

function addModelResponse(chatId, text) {
    chatMemory[chatId].push({
        role: "model",
        parts: [{ text }]
    });
}

function getConversation(chatId) {
    return chatMemory[chatId];
}

function trimConversation(chatId, limit = 20) {
    if (chatMemory[chatId].length > limit) {
        chatMemory[chatId] = chatMemory[chatId].slice(-limit);
    }
}

function clearConversation(chatId) {
    chatMemory[chatId] = [];
}

export {
    startGeminiSession,
    endGeminiSession,
    isGeminiActive,
    initChat,
    addUserMessage,
    addModelResponse,
    getConversation,
    trimConversation,
    clearConversation
};