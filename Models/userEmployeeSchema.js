import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    // role: {
    //   type: String,
    //   required: true,
    // },
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("UserSchema", userSchema);

export default UserSchema;
