const mongoose = require('mongoose');

const userChatSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
	  // unique: true
    },
    chats: [
      {
        _id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now()
        },
      },
    ],
  },
  { timestamps: true }
);

const userChats = mongoose.model("userChats", userChatSchema);
module.exports = userChats;

// export default mongoose.models.userChats || mongoose.model("userChats", userChatSchema);