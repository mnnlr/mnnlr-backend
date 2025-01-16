import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
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
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "daily",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
