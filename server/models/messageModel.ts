 const mongoose = require("mongoose");

  const messagesSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: { type: String, default: "text" },
  message: { type: String, required: true },
  messageStatus: { type: String, default: "sent" },
  createdAt: { type: Date, default: Date.now },
});

const MessagesModel = mongoose.model("Messages", messagesSchema);

module.exports = MessagesModel;
