import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    // id: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeSchema" },
    employeeId: {
      type: String,
      ref: "EmployeeSchema",
    },
    casualLeaveAppliedLastTime: {
      type: Date,
    },

    sickLeaveAppliedLastTime: {
      type: Date,
    },

    casualLeaveBalance: {
      type: Number,
      default: 0,
    },

    sickLeaveBalance: {
      type: Number,
      default: 0,
    },

    totalCasualLeaveUsed: {
      type: Number,
      default: 0,
      max: [12, "You have exhausted your casual leaves"],
    },

    totalSickLeaveUsed: {
      type: Number,
      default: 0,
      max: [12, "You have exhausted your sick leaves"],
    },

    leavesDetails: [
      {
        startDate: {
          type: Date,
        },
        endDate: {
          type: Date,
        },
        typeOfLeave: {
          type: String,
          enum: ["sick", "casual"],
        },
        reason: {
          type: String,
        },
        status: {
          type: String,
          enum: ["approved", "rejected", "pending"],
          default: "pending",
        },
      },
    ],

  },
  {
    timestamps: true,
});

const Leave = mongoose.model('Leave',leaveSchema);

export default Leave