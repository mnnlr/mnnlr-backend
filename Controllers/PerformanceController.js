import mongoose from "mongoose";
import Performance from "../Models/PerformanceModel.js";
import Employee from "../Models/employeeSchema.js";
import moment from "moment";
import calculateTotalWorkingHours from "../utils/calculateWorkinHours.js";
// import calculateTotalWorkingHours from "../utils/calculateWorkinHours.js";
import { ErrorHandler } from "../utils/errorHendler.js";

const getAllPerformance = async (req, res, next) => {
  try {

      const {period='today'} = req.query;
      console.log('period : ',period)

      const now = new Date();
      let startDate;

      switch (period) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "yesterday":
          startDate = new Date(now.setDate(now.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          throw new Error("Invalid period specified.");
      }

    const employees = await Employee.find({})
    const performances = await Performance.find({
      date: { $gte: startDate },
    })

    const employeeAttendence = employees.reduce((acc, employee) => {
      const { _id, firstName,avatar,designationLevel,employeeId,lastName, userId } = employee;
    
      // Find all performance records for the current employee
      const employeePerformances = performances.filter(({ user_id }) => userId === user_id.toString());
      console.log('employeePerformances : ',employeePerformances);

      // Group the performances by date
      const groupedPerformances = employeePerformances.reduce((groupAcc, performance) => {
        const { date, timeTracking } = performance;
        const dateString = new Date(date).toISOString().split('T')[0]; // Convert date to ISO string and extract the date part
    
        if (!groupAcc['attendence']) {
          groupAcc['attendence'] = [{
            date: dateString,
            Data:[]
          }];
        }
        const group = groupAcc['attendence'].find(group => group.date === dateString);
        if (!group) {
          groupAcc['attendence'].push({
            date: dateString,
            Data: timeTracking,
          });
        }
        if (group) {
          group.Data = [...group.Data, ...timeTracking];
        }
        return groupAcc;
      }, {});
    
      acc.push({
        _id,
        firstName,
        lastName,
        avatar,
        userId,
        employeeId,
        designationLevel,
        attendance: groupedPerformances.attendence,
      });
    
      return acc;
    }, []);

    res.status(200).json({ success: true, employeeAttendence });
  } catch (error) {
    next(error);
  }
};

const AllEmployeeAttandance = async (req, res,next) => {
  try {

    const { date } = req.query;

    const attandanceDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    const employees = await Employee.find({});
    const performances = await Performance.find({ date: attandanceDate });
    
    const employeeAttendance = await Promise.all(employees.map(async (employee) => {
      const { _id, firstName, avatar,email,designation, designationLevel, employeeId, lastName, userId } = employee;

      const employeePerformance = performances.find(({ user_id }) => userId === user_id.toString());

      if (!employeePerformance) {
        return {
          _id,
          firstName,
          lastName,
          avatar,
          email,
          userId,
          employeeId,
          designationLevel,
          designation,
        };
      }
    
      const { calculatedAttendance } = await new Promise((resolve,reject)=>{
        resolve(calculateTotalWorkingHours(employeePerformance));
        // reject()
      });

      return {
        _id,
        firstName,
        lastName,
        avatar,
        userId,
        email,
        employeeId,
        designationLevel,
        designation,
        attendance: calculatedAttendance,
      };
    }));

    // const result = await new Promise((resolve,reject)=>{
    //   resolve(employeeAttendance)
    //   reject([])
    // });

    // console.log('employeeAttendance123 : ',result);
    res.status(200).json({ success: true, Data: employeeAttendance });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const EmployeeAttandanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {date} = req.query;
    
    if (id === undefined){
      return res
        .status(404)
        .json({ success: false, message: "data not found" });
    }

    const today = date?new Date(date).toISOString().split('T')[0]:new Date().toISOString().split('T')[0];
    
    const [attandance,employee] = await Promise.all(
      [
        Performance.findOne({
          user_id: id,
          date: today,
        }),
        Employee.findOne({
          userId: id,
        })
  
      ]
    );
    const { _id:employeeDocId, firstName, avatar,designation,designationLevel,email, employeeId, lastName } = employee;
    const {calculatedAttendance} = attandance ? await calculateTotalWorkingHours(attandance) : {calculatedAttendance:null};
    

    return res.status(200).json({ success: true, Data: {...calculatedAttendance,employeeDocId, firstName, avatar,designation,email,designationLevel, employeeId, lastName} });

  } catch (error) {
    console.log('error : ',error)
    next(error);
  }
};

const gerPerformanceByWorkingHour = async (req, res, next) => {
  try {
    const { period } = req.query;

    let Period = "";
    if (!period) {
      Period = "today";
    } else {
      Period = period;
    }

    const performances = await Performance.find({})
      .populate({
        path: "employeeDocId",
        select:
          "firstName lastName avatar designation designationLevel employeeId",
      })
      .lean();

    for (let performance of performances) {
      const { hours, minutes, seconds } = await calculateTotalWorkingHours(
        performance,
        Period
      );
      performance.totalWorkingHour = `${hours}:${minutes}:${seconds}`;
      performance.timeInMiliseconds =
        hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
    }

    const sortedPerformances = performances.sort(
      (a, b) => b.timeInMiliseconds - a.timeInMiliseconds
    );

    res.status(200).json({ success: true, performance: sortedPerformances });
  } catch (error) {
    next(error);
  }
};

export {
  getAllPerformance,
  gerPerformanceByWorkingHour,
  AllEmployeeAttandance,
  EmployeeAttandanceById,
};
