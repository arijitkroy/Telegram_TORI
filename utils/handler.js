import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handleGemini from "../common/handleGemini.js";
import {
    isGeminiActive,
    isAwaitingTorrent,
    clearUserState
} from "../common/memory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = {};

const commandsDir = path.join(__dirname, '..', 'commands');
export async function initCommands() {
    const files = fs.readdirSync(commandsDir);
    for (const file of files) {
        const name = path.basename(file, '.js');
        const commandPath = path.join(commandsDir, file);
        const commandModule = await import(commandPath);
        commands[`/${name}`] = commandModule.default || commandModule;
    }
}

export default async function handler(chatId, text, sendMessage, callbackData = null) {
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

        const trimmedText = text.trim();
        const [command] = trimmedText.split(' ');
        const commandHandler = commands[command];

        if (commandHandler) {
            await commandHandler(chatId, text, sendMessage);
        } else if (trimmedText.startsWith('/')) {
            await sendMessage(chatId, '❓ Unknown command. Use /help.');
        } else if (isGeminiActive(chatId)) {
            await handleGemini(chatId, text, sendMessage);
        }
    } catch (err) {
        console.error("Handler failed:", err.message);
        await sendMessage(chatId, "⚠️ An internal error occurred.");
    }
}