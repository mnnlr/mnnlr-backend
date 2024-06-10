import Leave from "../Models/LeaveModel.js";
import Employee from "../Models/employeeSchema.js";
import {differenceInMonths} from 'date-fns';
import { ErrorHandler } from "../utils/errorHendler.js";

const getAllLeaveRequest = async(req,res,next) => {

    try {
        const allRequest = await Leave.find({status:"pending"}).populate('id');
        res.status(200).json({ message: "get all Request",Data:allRequest })
    } catch (error) {
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

        const {userId,typeOfLeave,startDate,endDate,reason} = req.body;

        if(!typeOfLeave || !startDate || !endDate || !reason){
            return next(new ErrorHandler(400, "Please provide all the details"));
        }

        const employee = await Employee.findOne({employeeId:userId});

        if(!employee){
            return next(new ErrorHandler(404, "Employee not found"));
        }

        const leaveRequest = await Leave.findOne({employeeId:userId,status:"pending"});
        const totalDays = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);


        let sickLeaveBal = 0;
        let casualLeaveBal = 0;

        if(!leaveRequest?.sickLeaveAppliedLastTime){
            sickLeaveBal = 2;
        }

        if(leaveRequest?.sickLeaveAppliedLastTime){
            const sickMonthDiff = differenceInMonths(new Date(),leaveRequest.sickLeaveAppliedLastTime);
            sickLeaveBal = sickMonthDiff*2;
        }

        if(!leaveRequest?.casualLeaveAppliedLastTime){
            casualLeaveBal = 2;
        }

        if(leaveRequest?.casualLeaveAppliedLastTime){
            const casualMonthDiff = differenceInMonths(new Date(),leaveRequest.sickLeaveAppliedLastTime);

            casualLeaveBal = casualMonthDiff*2;
        }

        if((totalDays > sickLeaveBal) && (typeOfLeave === "sick") ){

            return next(new ErrorHandler(400, "Leave Balance is not enough"));
        }

        if((totalDays > casualLeaveBal) && (typeOfLeave === "casual") ){

            return next(new ErrorHandler(400, "Leave Balance is not enough"));
        }

        
        await Leave.create({
            id:employee._id,
            employeeId:employee?.employeeId,
            sickLeaveBalance:sickLeaveBal&&sickLeaveBal,
            casualLeaveBalance:casualLeaveBal&&casualLeaveBal,
            sickLeaveAppliedLastTime:typeOfLeave === 'sick'?new Date():null,
            casualLeaveAppliedLastTime:typeOfLeave === 'casual'?new Date():null,
            typeOfLeave,
            startDate,
            endDate,
            reason
        })

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