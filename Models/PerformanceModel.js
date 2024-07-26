import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  
  date: {
    type: Date,
    default:Date.now,
    required: true,
  },

  timeTracking: [
    {
      timeIn: {
        type: String,
        required: true,
      },

      timeOut: {
        type: String,
      },

    },
  ],

});


const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
