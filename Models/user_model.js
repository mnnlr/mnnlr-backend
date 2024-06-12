import { randomUUID } from "crypto";
import mongoose from "mongoose";

// const userChat = new mongoose.Schema({
//   id: {
//     type: String,
//     default: randomUUID,
//   },
//   role: {
//     type: String,
//     required: true,
//   },
//   content: {
//     type: String,
//     required: true,
//   },
// });
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    refreshToken: {
      type: String,
    },
    // loginTime: {
    //   type: Date,
    //   default: Date.now,
    // },
    // logoutTime: {
    //   type: Date,
    // },
    // chat: [userChat],
  },
  { timestamps: true }
);
const user = mongoose.model("user", userSchema);

export default user;
