import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: [String],
       
    },

    photo:{
        data: Buffer,
        contentType: String,
     },

  },
  { timestamps: true }
);

export default mongoose.model("orders", orderSchema);
