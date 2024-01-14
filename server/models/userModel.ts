

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  about: { type: String, default: "" },
  sentMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Messages" }],
  receivedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Messages" }],
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
