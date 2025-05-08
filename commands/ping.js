module.exports = async function (chatId, text, sendMessage) {
    await sendMessage(chatId, "Pong!");
}

module.exports.syntax = '/ping - Replies with Pong!';