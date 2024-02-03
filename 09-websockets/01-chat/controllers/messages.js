const Message = require('../models/Message');
const mapMessages = require('../mappers/message');

module.exports.messageList = async function messages(ctx) {
  const messageList = await Message.find({ chat: ctx.user._id });
  ctx.body = { messages: messageList.map(mapMessages) };
};
