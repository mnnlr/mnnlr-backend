import mongoose from "mongoose";
import Performance from "../Models/PerformanceModel.js";
import Employee from "../Models/employeeSchema.js";
import moment from "moment";
import calculateTotalWorkingHours from "../utils/calculateWorkinHours.js";
// import calculateTotalWorkingHours from "../utils/calculateWorkinHours.js";
import { ErrorHandler } from "../utils/errorHendler.js";

const getAllPerformance = async (req, res, next) => {
  try {

    const { period = 'today' } = req.query;
    
    const now = new Date();
    let startDate;
    let endDate = new Date();
    
    switch (period) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "yesterday":
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        throw new Error("Invalid period specified.");
    }
    
    // startDate = startDate.toISOString();
    // endDate = endDate.toISOString();
    
    const result = await Employee.aggregate([
      {
        $addFields: {
          userId: { "$toObjectId": "$userId" }
        }
      },
      {
        $lookup: {
          from: "performances",
          localField: "userId",
          foreignField: "user_id",
          as: "employeeDetails",
        }
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          email: 1,
          userId: 1,
          employeeId: 1,
          designationLevel: 1,
          designation: 1,
          employeedOn:{
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          attendance: {
            $map: {
              input: "$employeeDetails",
              as: "detail",
              in: {
                _id: "$$detail._id",
                user_id: "$$detail.user_id",
                date: "$$detail.date",
                timeTracking: {
                  $map: {
                    input: "$$detail.timeTracking",
                    as: "time",
                    in: {
                      timeIn: "$$time.timeIn",
                      timeOut: {
                        $ifNull: [
                          "$$time.timeOut",
                          {
                            $dateToString: {
                              format: "%H:%M:%S",
                              date: { $dateAdd: { startDate: "$$detail.date", unit: "second", amount: 1 } }
                            } 
                          }
                        ]
                      },
                      duration: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$$time.timeOut", null] },
                              { $ne: ["$$time.timeIn", null] }
                            ]
                          },
                          then: {
                            $divide: [
                              {
                                $subtract: [
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 0] } },
                                      minute: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 1] } },
                                      second: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 2] } }
                                    }
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 0] } },
                                      minute: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 1] } },
                                      second: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 2] } }
                                    }
                                  }
                                ]
                              },
                              1000 // Convert milliseconds to seconds
                            ]
                          },
                          else: 0
                        }
                      }
                    }
                  }
                },
                totalDuration: {
                  $sum: {
                    $map: {
                      input: "$$detail.timeTracking",
                      as: "time",
                      in: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$$time.timeOut", null] },
                              { $ne: ["$$time.timeIn", null] }
                            ]
                          },
                          then: {
                            $divide: [
                              {
                                $subtract: [
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 0] } },
                                      minute: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 1] } },
                                      second: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 2] } }
                                    }
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 0] } },
                                      minute: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 1] } },
                                      second: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 2] } }
                                    }
                                  }
                                ]
                              },
                              1000 // Convert milliseconds to seconds
                            ]
                          },
                          else: 0
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          totalWorkingTime: {
            $sum: {
              $map: {
                input: "$employeeDetails",
                as: "detail",
                in: {
                  $sum: {
                    $map: {
                      input: "$$detail.timeTracking",
                      as: "time",
                      in: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$$time.timeOut", null] },
                              { $ne: ["$$time.timeIn", null] }
                            ]
                          },
                          then: {
                            $divide: [
                              {
                                $subtract: [
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 0] } },
                                      minute: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 1] } },
                                      second: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeOut", ":"] }, 2] } }
                                    }
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 0] } },
                                      minute: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 1] } },
                                      second: { $toInt: { $arrayElemAt: [{ $split: ["$$time.timeIn", ":"] }, 2] } }
                                    }
                                  }
                                ]
                              },
                              1000 // Convert milliseconds to seconds
                            ]
                          },
                          else: 0
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        }
      },
      {
        $sort: { totalWorkingTime: -1 }
      },
      {
        $group: {
          _id: null,
          employeePerformances: { $push: "$$ROOT" },
          totalWorkingTimeOfAllEmployee: { $sum: "$totalWorkingTime" }
        }
      },
    ]);
    
   
    res.status(200).json({ success: true, Data: result[0] });
    
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
    
    const employeeAttendance = await Promise.all(employees?.map(async (employee) => {
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

    res.status(200).json({ success: true, Data: employeeAttendance });
  } catch (error) {
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
    const { _id:employeeDocId, firstName, avatar,designation,designationLevel,phoneNo,email, employeeId, lastName } = employee;
    const {calculatedAttendance} = attandance ? await calculateTotalWorkingHours(attandance) : {calculatedAttendance:null};
    

    return res.status(200).json({ success: true, Data: {...calculatedAttendance,employeeDocId, firstName, avatar,designation,phoneNo,email,designationLevel, employeeId, lastName} });

  } catch (error) {
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
