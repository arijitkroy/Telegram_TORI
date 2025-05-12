const fs = require('fs');
const path = require('path');
const handleGemini = require("../common/handleGemini");
const {
    clearUserState,
    isAwaitingTorrent
} = require("../common/memory");

const commands = {};

fs.readdirSync(path.join(__dirname, '..', 'commands')).forEach(file => {
    const name = path.basename(file, '.js');
    commands[`/${name}`] = require(path.join(__dirname, '..', 'commands', file));
});

module.exports = async function handler(chatId, text, sendMessage, callbackData = null, document = null) {
    try {
        if (callbackData) {
            for (const [_, commandHandler] of Object.entries(commands)) {
                if (commandHandler.callback) {
                    await commandHandler(chatId, "", sendMessage, callbackData);
                    return;
                }
            }
            await sendMessage(chatId, "⚠️ Action not supported.");
            return;
        }

        if (document && isAwaitingTorrent(chatId)) {
            clearUserState(chatId);
            const uploadHandler = commands["/upload"];
            if (uploadHandler && uploadHandler.handleDocument) {
                await uploadHandler.handleDocument(chatId, document, sendMessage);
            } else {
                await sendMessage(chatId, "⚠️ Upload not supported at the moment.");
            }
            return;
        }

        const trimmedText = text.trim();
        const [command] = trimmedText.split(' ');
        const commandHandler = commands[command];

        if (commandHandler) {
            await commandHandler(chatId, text, sendMessage);
        } else if (trimmedText.startsWith('/')) {
            await sendMessage(chatId, '❓ Unknown command. Use /help.');
        } else {
            await handleGemini(chatId, text, sendMessage);
        }
    } catch (err) {
        console.error("Handler failed:", err.message);
        await sendMessage(chatId, "⚠️ An internal error occurred.");
    }
};