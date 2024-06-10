import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    
    title: {
      type: String,
      required: true,
    //   unique: true,
    },
    description: {
      type: String,
       
    },

  },
  { timestamps: true }
);

export default mongoose.model("pages", pageSchema);
