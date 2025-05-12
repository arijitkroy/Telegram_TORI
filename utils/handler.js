import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handleGemini from "../common/handleGemini.js";
import {
    clearUserState,
    isAwaitingTorrent
} from "../common/memory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = {};

const commandsDir = path.join(__dirname, '..', 'commands');
fs.readdirSync(commandsDir).forEach(file => {
    const name = path.basename(file, '.js');
    const commandPath = path.join(commandsDir, file);
    const commandModule = await import(commandPath);
    commands[`/${name}`] = commandModule.default || commandModule;
});

export default async function handler(chatId, text, sendMessage, callbackData = null, document = null) {
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
            const uploadHandler = commands["/torrent"];
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
}