import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function help(chatId, args, sendMessage) {
    const commandsPath = path.join(__dirname);
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== 'help.js');

    let helpText = '📜 Available Commands:\n\n';

    for (const file of files) {
        const commandPath = path.join(commandsPath, file);
        const commandModule = await import(commandPath);
        const command = commandModule.default || commandModule;
        const syntax = command.syntax || `/${path.basename(file, '.js')} - No description`;
        helpText += `• ${syntax}\n`;
    }

    helpText += '\nNote: You can chat normally without using /\nHave fun ;)\n';
    await sendMessage(chatId, helpText);
}

help.syntax = '/help - Show this help message';
export default help;