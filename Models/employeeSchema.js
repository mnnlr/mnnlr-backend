import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    aadhar: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    pan: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    Bank: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    PF: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },

    xthMarksheet: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },

    xiithMarksheet: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    graduationMarksheet: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    pgMarksheet: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    designation: {
      type: String,
      required: true,
    },
    designationLevel: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
    },

    avatar: {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    shift: {
      type: String,
      required: true,
      default: 'morning',
      enum: ["morning", "afternoon", "evening", "night"],
    },
    dateofjoining: {
      type: String,
      // default: () => new Date().toISOString().split('T')[0],
      // required: true,
    },
    AssignShiftsToHR: {
      type: [String]
    },
    AssignShiftsToManager: {
      type: [String]
    },
    employeeTeam: {
      type: String,
    },
    AssignedTeamsToHR: {
      type: [String]
    },
    AssignedTeamsToManager: {
      type: [String]
    },
  },
  { timestamps: true }
);

const EmployeeSchema = mongoose.model("EmployeeSchema", employeeSchema);

export default EmployeeSchema;
