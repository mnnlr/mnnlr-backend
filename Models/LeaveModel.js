import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    id:{ type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeSchema' },
    employeeId:{
        type:String,
        ref:"EmployeeSchema",
        required:true
    },
    
    typeOfLeave:{
        type:String,
        enum:["sick","casual"],
        required:true
    },

    casualLeaveAppliedLastTime:{
        type:Date
    },

    sickLeaveAppliedLastTime:{
        type:Date
    },

    casualLeaveBalance:{
        type:Number,
        default:0
    },

    sickLeaveBalance:{
        type:Number,
        default:0
    },

    totalCasualLeaveUsed:{
        type:Number,
        default:0,
        max:[12,"You have exhausted your casual leaves"]
    },

    totalSickLeaveUsed:{
        type:Number,
        default:0,
        max:[12,"You have exhausted your sick leaves"]
    },

    startDate:{
        type:Date,
        required:true
    },

    endDate:{
        type:Date,
        required:true
    },

    reason:{
        type:String,
        required:true
    },

    status:{
        type:String,
        enum:["approved","rejected","pending"],
        default:"pending"
    }
},{
    timestamps:true
})

leaveSchema.virtual('employee', {
    ref: 'EmployeeSchema',
    localField: 'employeeId',
    foreignField: 'employeeId',
    justOne: true // Since employeeId is unique, we want only one document
});

const Leave = mongoose.model('Leave',leaveSchema);

export default Leave