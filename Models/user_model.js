import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email:{
      type: String,
    },
    username: {
      type: String,
      required: true,
      // unique: true,
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
  },
  { timestamps: true }
);
const user = mongoose.model("user", userSchema);

export default user;
