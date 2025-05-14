const chatMemory = {};
const userStates = new Map();
const userMap = new Map();
const activeChats = new Map();
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


function registerUser(username, chatId) {
    if (username?.startsWith("@")) username = username.slice(1);
    userMap.set(username, chatId);
}

function getChatIdByUsername(username) {
    if (username?.startsWith("@")) username = username.slice(1);
    return userMap.get(username);
}

function createChatBridge(user1, user2) {
    activeChats.set(user1, user2);
    activeChats.set(user2, user1);
}

function getChatPartner(chatId) {
    return activeChats.get(chatId);
}

function endChat(chatId) {
    const partner = activeChats.get(chatId);
    activeChats.delete(chatId);
    if (partner) activeChats.delete(partner);
}


function setAwaitingTorrent(chatId) {
    userStates.set(chatId, { awaitingTorrent: true });
}

function clearUserState(chatId) {
    userStates.delete(chatId);
}

function isAwaitingTorrent(chatId) {
    return userStates.get(chatId)?.awaitingTorrent;
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
    activeGeminiUsers,
    registerUser,
    getChatIdByUsername,
    createChatBridge,
    getChatPartner,
    endChat,
    setAwaitingTorrent,
    clearUserState,
    isAwaitingTorrent,
    initChat,
    addUserMessage,
    addModelResponse,
    getConversation,
    trimConversation,
    clearConversation
};