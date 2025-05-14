async function ping(chatId, text, sendMessage) {
    await sendMessage(chatId, "Pong!");
}

ping.syntax = '/ping - Replies with Pong!';
export default ping;