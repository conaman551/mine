class Message {
    constructor({ timeReceived, content, timeSent, senderId, chatId }) {
      this.timeReceived = timeReceived;
      this.content = content;
      this.timeSent = timeSent;
      this.senderId = senderId;
      this.chatId = chatId;
    }
  
  }
  
  module.exports = Messages;
  