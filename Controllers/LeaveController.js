import Leave from "../Models/LeaveModel.js";
import Employee from "../Models/employeeSchema.js";
// import { differenceInMonths } from 'date-fns';
import { ErrorHandler } from "../utils/errorHendler.js";

const getAllLeaveRequest = async (req, res, next) => {

    try {
        // const allRequest = await Leave.find({}).populate('employeeId');
        const allRequest = await Leave.find({}).populate('employeeId');

        // Filter out requests where employeeId is null
        const filteredRequests = allRequest.filter(request => request.employeeId !== null);

        // Process the filtered requests
        const employeeLeave = filteredRequests.flatMap(request => {
            const {
                employeeId: {
                    _id, avatar, email, designation, designationLevel, firstName, lastName, employeeId
                } = {}, // Add default destructuring
                leavesDetails
            } = request;

            // const pendingLeaves = leavesDetails?.filter(leave => leave?.status === 'pending');
            // console.log('pendingLeaves : ',pendingLeaves?.length)
            // console.log('leavesDetails : ',leavesDetails?.length)
            // if (pendingLeaves?.length === 0 && leavesDetails?.length !== 0) {
            //     console.log('no pendingLeaves')
            //     return {
            //         _id,
            //         employeeId: employeeId,
            //         avatar: avatar,
            //         name: `${firstName} ${lastName}`,
            //         email: email,
            //         leavesDetails,
            //         duration: leavesDetails[0]?.endDate - leavesDetails[0]?.startDate, // Assuming the duration is in milliseconds
            //         leaveType: leavesDetails[0]?.typeOfLeave.charAt(0).toUpperCase() + leavesDetails[0]?.typeOfLeave.slice(1), // Capitalize first letter
            //         startDate: leavesDetails[0]?.startDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
            //         endDate: leavesDetails[0]?.endDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
            //         status: leavesDetails[0]?.status.charAt(0).toUpperCase() + leavesDetails[0]?.status.slice(1), // Capitalize first letter
            //         leaveBalance: leavesDetails?.sickLeaveBalance + leavesDetails?.casualLeaveBalance,
            //         dateApplied: leavesDetails[0]?._id.getTimestamp().toISOString().split('T')[0], // Assuming leave._id contains timestamp
            //         reason: leavesDetails[0]?.reason,
            //         approverComments: ''
            //     };
            // }

            // if(pendingLeaves?.length !== 0){

            //     console.log('we have pendingLeaves : ',pendingLeaves?.length)
            // console.log('sick leave balance : ',leavesDetails)
            // console.log('casual leave balance : ',leavesDetails?.casualLeaveBalance)

            return leavesDetails.map(leave => ({
                _id,
                leaveId: leave._id,
                employeeId: employeeId,
                designation,
                designationLevel,
                avatar: avatar,
                name: `${firstName} ${lastName}`,
                email: email,
                leavesDetails,
                sickLeaveBalance: request?.sickLeaveBalance,
                totalSickLeaveUsed: request?.totalSickLeaveUsed,
                casualLeaveBalance: request?.casualLeaveBalance,
                totalCasualLeaveUsed: request?.totalCasualLeaveUsed,
                duration: Math.abs(new Date(leave?.endDate) - new Date(leave?.startDate)) / (1000 * 60 * 60 * 24) + 1,
                leaveType: leave.typeOfLeave.charAt(0).toUpperCase() + leave.typeOfLeave.slice(1),
                startDate: leave.startDate.toISOString().split('T')[0],
                endDate: leave.endDate.toISOString().split('T')[0],
                status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
                leaveBalance: request?.sickLeaveBalance + request?.casualLeaveBalance,
                dateApplied: leave._id.getTimestamp().toISOString().split('T')[0],
                reason: leave.reason,
                approverComments: ""
            }));
            // }
        });

        console.log("employeeLeave: ", employeeLeave)

        res.status(200).json({ message: "get all Request", Data: employeeLeave, success: true })
    } catch (error) {
        console.log('error : ', error)
        next(error)
    }

}

const getLeaveRequestById = async (req, res, next) => {

    try {

        const { id } = req.params;

        if (!id) {
            return next(new ErrorHandler(400, "Please provide an id"));
        }

        const request = await Leave.findOne({ id: id, status: "pending" });

        if (!request) {
            return next(new ErrorHandler(404, "Request not found"));
        }

        res.status(200).json({ message: "get Request", Data: request })

    } catch (error) {

        next(error)

    }

}


const leaveRequest = async (req, res, next) => {

    try {

        const { id, typeOfLeave, startDate, endDate, reason } = req.body;

        if (!id || !typeOfLeave || !startDate || !endDate || !reason) {
            return next(new ErrorHandler(400, "Please provide all the details"));
        }

        if (typeOfLeave !== "sick" && typeOfLeave !== "casual") {
            return next(new ErrorHandler(400, "Invalid Type of Leave"));
        }

        if (new Date(startDate) > new Date(endDate)) {
            return next(new ErrorHandler(400, "Start Date should be less than End Date"));
        }

        if (typeof reason !== "string") {
            return next(new ErrorHandler(400, "Please provide a valid reason"));
        }

        const employee = await Employee.findOne({ userId: id });

        if (!employee) {
            return next(new ErrorHandler(404, "Employee not found"));
        }

        const totalDays = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
        console.log('totalDays : ', totalDays)

        const leaveRequest = await Leave.findOne({ employeeId: employee?._id });

        if (!leaveRequest) {
            return next(new ErrorHandler(404, "Not Applicable for Leave Request"));
        }

        if ((totalDays > leaveRequest?.sickLeaveBalance) && (typeOfLeave === "sick")) {
            return next(new ErrorHandler(400, "Sick Leave Balance is not enough"));
        }

        if ((totalDays > leaveRequest?.casualLeaveBalance) && (typeOfLeave === "casual")) {
            return next(new ErrorHandler(400, "Casual Leave Balance is not enough"));
        }


        const leave = await Leave.findOneAndUpdate({ employeeId: employee?._id }, {
            sickLeaveAppliedLastTime: typeOfLeave === 'sick' ? new Date() : leaveRequest?.sickLeaveAppliedLastTime,
            casualLeaveAppliedLastTime: typeOfLeave === 'casual' ? new Date() : leaveRequest?.casualLeaveAppliedLastTime,

            $push: { leavesDetails: { typeOfLeave, startDate, endDate, reason } }

        }, { new: true });

        console.log(leave)

        res.status(200).json({ message: "Leave Requested successfully", success: false, data: leave });


    } catch (error) {
        console.log('error : ', error)
        next(error)
    }

}

const approveLeaveRequest = async (req, res, next) => {

    try {

        const { id } = req.params;

        const { reviewStatus, leaveId } = req.body;

        if (!id || !reviewStatus.toString() || !leaveId) {
            return next(new ErrorHandler(400, "Please provide all the details"));
        }

        const leaveRequest = await Leave.findOne({ employeeId: id, leavesDetails: { $elemMatch: { _id: leaveId, status: "pending" } } });

        if (!leaveRequest) {
            return next(new ErrorHandler(404, "Request not found"));
        }

        const pendingLeave = leaveRequest?.leavesDetails.find(leave => leave?._id?.toString() === leaveId);


        if (!pendingLeave?._id) {
            return next(new ErrorHandler(404, "Request not found"));
        }

        if (reviewStatus === false) {
            await Leave.findOneAndUpdate({ employeeId: id, "leavesDetails._id": leaveId }, { $set: { "leavesDetails.$.status": "rejected" } }, { new: true });
            return res.status(200).json({ message: "Employee Leave Request Rejected", success: false });
        }

        if (reviewStatus === true) {

            const totalDays = Math.abs(new Date(pendingLeave?.endDate) - new Date(pendingLeave?.startDate)) / (1000 * 60 * 60 * 24) + 1;

            await Leave.findOneAndUpdate(
                { employeeId: id, "leavesDetails._id": leaveId },
                {
                    sickLeaveBalance: pendingLeave.typeOfLeave === "sick" ? leaveRequest.sickLeaveBalance - totalDays : leaveRequest.sickLeaveBalance,
                    casualLeaveBalance: pendingLeave.typeOfLeave === "casual" ? leaveRequest.casualLeaveBalance - totalDays : leaveRequest.casualLeaveBalance,
                    totalCasualLeaveUsed: pendingLeave.typeOfLeave === "casual" ? leaveRequest.totalCasualLeaveUsed + totalDays : leaveRequest.totalCasualLeaveUsed,
                    totalSickLeaveUsed: pendingLeave.typeOfLeave === "sick" ? leaveRequest.totalSickLeaveUsed + totalDays : leaveRequest.totalSickLeaveUsed,
                    $set: { "leavesDetails.$.status": "approved" }
                },
                { new: true }
            );
            return res.status(200).json({ message: "Employee Leave Request Approved", success: true });
        }

    } catch (error) {

        next(error)

    }

}


export { getAllLeaveRequest, leaveRequest, getLeaveRequestById, approveLeaveRequest }