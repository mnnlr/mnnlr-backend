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

// performanceSchema.virtual("totalWorkingHour").get(function () {
//   let totalWorkingHours = 0;

//   this.timeTracking.forEach((entry) => {
//     const timeIn = parseTime(entry.timeIn);
//     const timeOut = entry.timeOut ? parseTime(entry.timeOut) : new Date();
//     const workedMilliseconds = timeOut - timeIn;
//     totalWorkingHours += workedMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
//   });

//   return totalWorkingHours;
// });

// function parseTime(timeStr) {
//   const [hours, minutes, seconds] = timeStr.split(":").map(Number);
//   const now = new Date();
//   now.setHours(hours, minutes, seconds, 0);
//   return now;
// }

const Performance = mongoose.model("Performance", performanceSchema);

export default Performance;
