const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
	    // unique: true
    },
    history: [
      {
        role: {
          type: String,
          enum: ["user", "model"],
          required: true,
        },
        parts: [
          {
            text: {
              type: String,
              required: true,
            },
          },
        ],
        img: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

const Chat = mongoose.model("chat", chatSchema);
module.exports = Chat;

// export default mongoose.models.chat || mongoose.model("chat", chatSchema);