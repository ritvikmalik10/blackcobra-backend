const mongoose = require('mongoose');


const ChatSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },

  userMessage: {
    type: String,
    required: true
  },

  botReply: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chat', ChatSchema);

