const fs = require('fs');
const path = require('path');
const handleGemini = require("../common/handleGemini");

const commands = {};

fs.readdirSync(path.join(__dirname, '..', 'commands')).forEach(file => {
    const name = path.basename(file, '.js');
    commands[`/${name}`] = require(path.join(__dirname, '..', 'commands', file));
});

module.exports = async function handler(chatId, text, sendMessage) {
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
};