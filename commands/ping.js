async function pingCommand(chatId, text, sendMessage) {
    await sendMessage(chatId, "Pong!");
}

pingCommand.syntax = '/ping - Replies with Pong!';
export default pingCommand;