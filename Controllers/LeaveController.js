import Leave from "../Models/LeaveModel.js";
import Employee from "../Models/employeeSchema.js";
import {differenceInMonths} from 'date-fns';
import { ErrorHandler } from "../utils/errorHendler.js";

const getAllLeaveRequest = async(req,res,next) => {

    try {
        const allRequest = await Leave.find({}).populate('employeeId');
        
        const employeeLeave = allRequest.flatMap(request => {
            const {
                employeeId: { avatar, email, firstName, lastName, employeeId },
                leavesDetails
            } = request;
        
            return leavesDetails.map(leave => ({
                employeeId: employeeId,
                avatar: avatar,
                name: `${firstName} ${lastName}`,
                email: email,
                duration:Math.abs(new Date(leave?.endDate) - new Date(leave?.startDate)) / (1000 * 60 * 60 * 24)+1,
                leaveType: leave.typeOfLeave.charAt(0).toUpperCase() + leave.typeOfLeave.slice(1), // Capitalize first letter
                startDate: leave.startDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
                endDate: leave.endDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
                status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1), // Capitalize first letter
                leaveBalance: 1, // Assuming a default value of 1 for demonstration
                dateApplied: leave._id.getTimestamp().toISOString().split('T')[0], // Assuming leave._id contains timestamp
                reason: leave.reason,
                approverComments: "" // Assuming an empty string for demonstration
            }));
        });
        console.log('employeeLeave : ',employeeLeave.length)
        res.status(200).json({ message: "get all Request",Data:employeeLeave })
    } catch (error) {
        console.log('error : ',error)
        next(error)
    }

}

const getLeaveRequestById = async(req,res,next) => {
    
        try {
 
            const {id} = req.params;

            if(!id){
                return next(new ErrorHandler(400, "Please provide an id"));
            }
    
            const request = await Leave.findOne({id:id,status:"pending"});
    
            if(!request){
                return next(new ErrorHandler(404, "Request not found"));
            }
    
            res.status(200).json({ message: "get Request",Data:request })
    
        } catch (error) {
    
            next(error)
    
        }
    
    }
    

const leaveRequest = async(req,res,next) => {

    try {

        const {id,typeOfLeave,startDate,endDate,reason} = req.body;
        
        if(!id || !typeOfLeave || !startDate || !endDate || !reason){
            return next(new ErrorHandler(400, "Please provide all the details"));
        }

        if(typeOfLeave !== "sick" && typeOfLeave !== "casual"){
            return next(new ErrorHandler(400, "Invalid Type of Leave"));
        }

        if(new Date(startDate) > new Date(endDate)){
            return next(new ErrorHandler(400, "Start Date should be less than End Date"));
        }

        if(typeof reason !== "string"){
            return next(new ErrorHandler(400, "Please provide a valid reason"));
        }

        const employee = await Employee.findOne({userId:id});

        if(!employee){
            return next(new ErrorHandler(404, "Employee not found"));
        }

        const leaveRequest = await Leave.findOne({employeeId:employee?._id});

        if(!leaveRequest){
            return next(new ErrorHandler(404, "Not Applicable for Leave Request"));
        }

        const totalDays = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)+1;
        console.log('totalDays : ',totalDays)

        if((totalDays > leaveRequest?.sickLeaveBalance) && (typeOfLeave === "sick") ){
            return next(new ErrorHandler(400, "Sick Leave Balance is not enough"));
        }

        if((totalDays > leaveRequest?.casualLeaveBalance) && (typeOfLeave === "casual") ){
            return next(new ErrorHandler(400, "Casual Leave Balance is not enough"));
        }

        
        await Leave.findOneAndUpdate({employeeId:employee?._id},{

            sickLeaveBalance:typeOfLeave === 'sick'?(leaveRequest?.sickLeaveBalance - totalDays):leaveRequest?.sickLeaveBalance,
            casualLeaveBalance:typeOfLeave === 'casual'?(leaveRequest?.casualLeaveBalance - totalDays):leaveRequest?.casualLeaveBalance,

            totalCasualLeaveUsed:typeOfLeave === 'casual'?leaveRequest?.totalCasualLeaveUsed + totalDays:leaveRequest?.totalCasualLeaveUsed,
            totalSickLeaveUsed:typeOfLeave === 'sick'?leaveRequest?.totalSickLeaveUsed + totalDays:leaveRequest?.totalSickLeaveUsed,

            sickLeaveAppliedLastTime:typeOfLeave === 'sick'?new Date():leaveRequest?.sickLeaveAppliedLastTime,
            casualLeaveAppliedLastTime:typeOfLeave === 'casual'?new Date():leaveRequest?.casualLeaveAppliedLastTime,

            $push:{leavesDetails:{typeOfLeave,startDate,endDate,reason}}

        },{new:true});

        res.status(200).json({ message:"Leave Requested successfully",success:false});

        
    } catch (error) {
        console.log('error : ',error)
        next(error)
    }

}

const approveLeaveRequest = async(req,res,next) => {

    try {

        const {id} = req.params;
        const {status} = req.body;

        if(!id){
            return next(new ErrorHandler(400, "Please provide an id"));
        }

        const leaveRequest = await Leave.findOne({id:id,status:"pending"});

        if(!leaveRequest){
            return next(new ErrorHandler(404, "Request not found"));
        }
        
        if(status === true){
            if(leaveRequest.typeOfLeave === "sick"){
                const totalDays = Math.abs(new Date(leaveRequest?.endDate) - new Date(leaveRequest?.startDate)) / (1000 * 60 * 60 * 24);

                await Leave.findOneAndUpdate({id:id},{sickLeaveBalance:leaveRequest.sickLeaveBalance-totalDays,status:"approved"},{new:true});
                return res.status(200).json({ message: "Employee Leave Request Approved",success:true });
            }
            
            if(leaveRequest.typeOfLeave === "casual"){
                const totalDays = Math.abs(new Date(leaveRequest?.endDate) - new Date(leaveRequest?.startDate)) / (1000 * 60 * 60 * 24);

                await Leave.findOneAndUpdate({id:id},{casualLeaveBalance:leaveRequest.casualLeaveBalance-totalDays,status:"approved"},{new:true});
                return res.status(200).json({ message: "Employee Leave Request Approved",success:true });
            }
        }
            if(status === false){
                await Leave.findOneAndUpdate({id:id},{status:"rejected"},{new:true});
                return res.status(200).json({ message: "Employee Leave Request Rejected",success:false });
            }

    } catch (error) {

        next(error)

    }

}


export { getAllLeaveRequest, leaveRequest,getLeaveRequestById,approveLeaveRequest }