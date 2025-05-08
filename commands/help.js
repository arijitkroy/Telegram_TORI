const fs = require('fs');
const path = require('path');

module.exports = async function helpCommand(chatId, args, sendMessage) {
    const commandsPath = path.join(__dirname);
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== 'help.js');

    let helpText = '📜 Available Commands:\n\n';

    for (const file of files) {
        const command = require(path.join(commandsPath, file));
        const syntax = command.syntax || `/${path.basename(file, '.js')} - No description`;
        helpText += `• ${syntax}\n`;
    }

    sendMessage(chatId, helpText);
};

module.exports.syntax = '/help - Show this help message';