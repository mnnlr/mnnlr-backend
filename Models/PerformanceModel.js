import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  employeeDocId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployeeSchema",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  timeTracking: [
    {
      date: {
        type: Date,
        required: true,
      },
      timeIn: {
        type: String,
        required: true,
      },
      timeOut: {
        type: String,
        // required:true
      },
    },
  ],
});


const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
