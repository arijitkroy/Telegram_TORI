async function start(chatId, text, sendMessage) {
    await sendMessage(chatId, "Hello there! I am TORI, a multi-purpose bot for your entertainment. Feel free to explore my commands by doing /help\n\nMade by @ArijitKRoy");
}

start.syntax = "/start - Introduction of the bot";
export default start;