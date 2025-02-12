import mongoose from "mongoose";
import Performance from "../Models/PerformanceModel.js";
import Employee from "../Models/employeeSchema.js";
import moment from "moment";
import calculateTotalWorkingHours from "../utils/calculateWorkinHours.js";
import { ErrorHandler } from "../utils/errorHendler.js";
import user from "../Models/user_model.js";
import User from "../Models/user_model.js";

const getAllPerformance = async (req, res, next) => {
  try {
    const { period = "week" } = req.query;

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

    const result = await Employee.aggregate([
      {
        $addFields: {
          userId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "performances",
          localField: "userId",
          foreignField: "user_id",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "users", // lookup to fetch role from user collection
          localField: "userId", // matching the userId in the employee collection
          foreignField: "_id", // matching the _id of user in the users collection
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo", // Unwind the array to get the role directly from the userInfo object
      },
      {
        $match: {
          "userInfo.role": { $in: ["employee", "hr"] }, // Match both 'employee' and 'hr'
        },
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
          role: "$userInfo.role", // Include the role from userInfo
          employeedOn: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
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
                              date: {
                                $dateAdd: {
                                  startDate: "$$detail.date",
                                  unit: "second",
                                  amount: 1,
                                },
                              },
                            },
                          },
                        ],
                      },
                      duration: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$$time.timeOut", null] },
                              { $ne: ["$$time.timeIn", null] },
                            ],
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
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                              1000, // Convert milliseconds to seconds
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
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
                              { $ne: ["$$time.timeIn", null] },
                            ],
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
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                              1000, // Convert milliseconds to seconds
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
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
                              { $ne: ["$$time.timeIn", null] },
                            ],
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
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                              1000, // Convert milliseconds to seconds
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: { totalWorkingTime: -1 },
      },
      {
        $group: {
          _id: null,
          employeePerformances: { $push: "$$ROOT" },
          totalWorkingTimeOfAllEmployee: { $sum: "$totalWorkingTime" },
        },
      },
    ]);

    res
      .status(200)
      .json({ success: true, message: "success", Data: result[0] });
  } catch (error) {
    next(error);
  }
};

const getHRAllPerformance = async (req, res, next) => {
  try {
    const { period = "week" } = req.query;

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

    const result = await Employee.aggregate([
      {
        $addFields: {
          userId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "performances",
          localField: "userId",
          foreignField: "user_id",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "users", // lookup to fetch role from user collection
          localField: "userId", // matching the userId in the employee collection
          foreignField: "_id", // matching the _id of user in the users collection
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $match: {
          "userInfo.role": "employee",
        },
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
          role: "$userInfo.role", // Include the role from userInfo
          employeedOn: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
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
                              date: {
                                $dateAdd: {
                                  startDate: "$$detail.date",
                                  unit: "second",
                                  amount: 1,
                                },
                              },
                            },
                          },
                        ],
                      },
                      duration: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$$time.timeOut", null] },
                              { $ne: ["$$time.timeIn", null] },
                            ],
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
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                              1000, // Convert milliseconds to seconds
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
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
                              { $ne: ["$$time.timeIn", null] },
                            ],
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
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                              1000, // Convert milliseconds to seconds
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
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
                              { $ne: ["$$time.timeIn", null] },
                            ],
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
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeOut", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                  {
                                    $dateFromParts: {
                                      year: { $year: "$$detail.date" },
                                      month: { $month: "$$detail.date" },
                                      day: { $dayOfMonth: "$$detail.date" },
                                      hour: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            0,
                                          ],
                                        },
                                      },
                                      minute: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            1,
                                          ],
                                        },
                                      },
                                      second: {
                                        $toInt: {
                                          $arrayElemAt: [
                                            { $split: ["$$time.timeIn", ":"] },
                                            2,
                                          ],
                                        },
                                      },
                                    },
                                  },
                                ],
                              },
                              1000, // Convert milliseconds to seconds
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: { totalWorkingTime: -1 },
      },
      {
        $group: {
          _id: null,
          employeePerformances: { $push: "$$ROOT" },
          totalWorkingTimeOfAllEmployee: { $sum: "$totalWorkingTime" },
        },
      },
    ]);

    res
      .status(200)
      .json({ success: true, message: "success", Data: result[0] });
  } catch (error) {
    next(error);
  }
};

const AllEmployeeAttandance = async (req, res, next) => {
  try {
    const { date } = req.query;

    // Format the date to YYYY-MM-DD
    const attendanceDate = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const users = await User.find({ role: { $in: ["employee", "hr"] } });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No employees found" });
    }

    const employeeIds = users.map((user) => user._id);
    // console.log("employeeIds: ", employeeIds);

    const employees = await Employee.find({ userId: { $in: employeeIds } });
    // console.log("employees: ", employees);

    if (employees.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No employee data found" });
    }

    const performances = await Performance.find({ date: attendanceDate });

    const employeeAttendance = await Promise.all(
      employees.map(async (employee) => {
        const {
          _id,
          firstName,
          avatar,
          email,
          designation,
          designationLevel,
          employeeId,
          lastName,
          userId,
        } = employee;

        const employeePerformance = performances.find(
          (performance) => performance.user_id.toString() === userId.toString(),
        );

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
            isActive: false,
          };
        }

        const { calculatedAttendance } =
          await calculateTotalWorkingHours(employeePerformance);

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
          isActive: employeePerformance.isActive,
        };
      }),
    );

    res.status(200).json({ success: true, Data: employeeAttendance });
  } catch (error) {
    next(error);
  }
};

const getAllHrAttandance = async (req, res, next) => {
  try {
    const { date } = req.query;

    const attendanceDate = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const users = await User.find({ role: "employee" });

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No HR found" });
    }
    const employeeIds = users.map((user) => user._id);
    // console.log("employeeIds: ", employeeIds);

    const employees = await Employee.find({ userId: { $in: employeeIds } });
    // console.log("employees: ", employees);

    if (employees.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No employee data found" });
    }

    const performances = await Performance.find({ date: attendanceDate });

    const employeeAttendance = await Promise.all(
      employees.map(async (employee) => {
        const {
          _id,
          firstName,
          avatar,
          email,
          designation,
          designationLevel,
          employeeId,
          lastName,
          userId,
        } = employee;

        const employeePerformance = performances.find(
          (performance) => performance.user_id.toString() === userId.toString(),
        );

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
            isActive: false,
          };
        }

        const { calculatedAttendance } =
          await calculateTotalWorkingHours(employeePerformance);

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
          isActive: employeePerformance.isActive,
        };
      }),
    );

    res.status(200).json({ success: true, Data: employeeAttendance });
  } catch (error) {
    next(error);
  }
};

const EmployeeAttandanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!id) {
      return res
        .status(404)
        .json({ success: false, message: "Data not found" });
    }

    const today = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const employee = await Employee.findOne({ userId: id });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    const attendance = await Performance.findOne({
      user_id: id,
    }).sort({ date: -1 });

    const {
      _id: employeeDocId,
      firstName,
      avatar,
      designation,
      designationLevel,
      phoneNo,
      email,
      employeeId,
      lastName,
    } = employee;

    let latestTimeIn = null;
    let latestTimeOut = null;
    let duration = null;

    if (attendance && attendance.timeIn) {
      latestTimeIn = attendance.timeIn;
      latestTimeOut = attendance.timeOut;

      if (latestTimeOut) {
        const timeInDate = new Date(`1970-01-01T${latestTimeIn}Z`); // Parse timeIn
        const timeOutDate = new Date(`1970-01-01T${latestTimeOut}Z`); // Parse timeOut
        const diffInMillis = timeOutDate - timeInDate; // Calculate difference in milliseconds

        // Convert milliseconds to hours
        duration = (diffInMillis / (1000 * 60 * 60)).toFixed(2);
      }
    }

    const { calculatedAttendance } = attendance
      ? await calculateTotalWorkingHours(attendance)
      : { calculatedAttendance: null };

    return res.status(200).json({
      success: true,
      Data: {
        ...calculatedAttendance,
        employeeDocId,
        firstName,
        avatar,
        designation,
        phoneNo,
        email,
        designationLevel,
        employeeId,
        lastName,
        latestTimeIn,
        latestTimeOut,
        duration,
      },
    });
  } catch (error) {
    // Handle any errors
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
        Period,
      );
      performance.totalWorkingHour = `${hours}:${minutes}:${seconds}`;
      performance.timeInMiliseconds =
        hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
    }

    const sortedPerformances = performances.sort(
      (a, b) => b.timeInMiliseconds - a.timeInMiliseconds,
    );

    res.status(200).json({ success: true, performance: sortedPerformances });
  } catch (error) {
    next(error);
  }
};
const getAttendanceByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { period } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required.",
      });
    }

    // Validate the period type
    const validPeriods = ["daily", "weekly", "monthly", "yearly"];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid period. Accepted values are 'daily', 'weekly', 'monthly', or 'yearly'.",
      });
    }

    // Fetch the performance data of the user
    const performanceData = await Performance.find({ user_id: userId }).select(
      "timeTracking date user_id",
    );

    if (!performanceData || performanceData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No performance data found for this user.",
      });
    }

    // Convert time format to minutes
    const convertToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 60 + minutes + seconds / 60;
    };

    const employee = await Employee.findOne({ userId: userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const joinDateStr = employee.dateofjoining;
    const joinDate = new Date(joinDateStr);

    if (isNaN(joinDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing join date for employee.",
      });
    }

    // Format the join date as YYYY-MM-DD (only the date part)
    const joinDateFormatted = joinDate.toISOString().split("T")[0];

    const filteredData = performanceData.filter((performance) => {
      if (!performance.date || isNaN(new Date(performance.date).getTime())) {
        return false;
      }

      const performanceDateFormatted = new Date(performance.date)
        .toISOString()
        .split("T")[0];
      return performanceDateFormatted >= joinDateFormatted;
    });

    if (filteredData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No performance data found for this user after the join date.`,
      });
    }

    const groupByDay = (data) => {
      return data.reduce((groups, performance) => {
        const day = new Date(performance.date).toISOString().split("T")[0];
        if (!groups[day]) {
          groups[day] = { day, totalDuration: 0 };
        }
        performance.timeTracking.forEach((time) => {
          const timeIn =
            time.timeIn && typeof time.timeIn === "string"
              ? convertToMinutes(time.timeIn)
              : 0;
          const timeOut =
            time.timeOut && typeof time.timeOut === "string"
              ? convertToMinutes(time.timeOut)
              : 0;
          const duration = timeOut - timeIn;
          if (duration > 0) groups[day].totalDuration += duration;
        });
        return groups;
      }, {});
    };

    const groupByWeek = (data) => {
      return data.reduce((groups, performance) => {
        const weekNumber = getWeekNumber(new Date(performance.date));
        if (!groups[weekNumber]) {
          groups[weekNumber] = { week: `Week ${weekNumber}`, totalDuration: 0 };
        }
        performance.timeTracking.forEach((time) => {
          const timeIn =
            time.timeIn && typeof time.timeIn === "string"
              ? convertToMinutes(time.timeIn)
              : 0;
          const timeOut =
            time.timeOut && typeof time.timeOut === "string"
              ? convertToMinutes(time.timeOut)
              : 0;
          const duration = timeOut - timeIn;
          if (duration > 0) groups[weekNumber].totalDuration += duration;
        });
        return groups;
      }, {});
    };

    const groupByMonth = (data) => {
      return data.reduce((groups, performance) => {
        const month = new Date(performance.date).getMonth() + 1;
        const year = new Date(performance.date).getFullYear();
        const period = `${year}-${month < 10 ? "0" + month : month}`;
        if (!groups[period]) {
          groups[period] = { period, totalDuration: 0 };
        }
        performance.timeTracking.forEach((time) => {
          const timeIn =
            time.timeIn && typeof time.timeIn === "string"
              ? convertToMinutes(time.timeIn)
              : 0;
          const timeOut =
            time.timeOut && typeof time.timeOut === "string"
              ? convertToMinutes(time.timeOut)
              : 0;
          const duration = timeOut - timeIn;
          if (duration > 0) groups[period].totalDuration += duration;
        });
        return groups;
      }, {});
    };

    const groupByYear = (data) => {
      return data.reduce((groups, performance) => {
        const year = new Date(performance.date).getFullYear();
        if (!groups[year]) {
          groups[year] = { year, totalDuration: 0 };
        }
        performance.timeTracking.forEach((time) => {
          const timeIn =
            time.timeIn && typeof time.timeIn === "string"
              ? convertToMinutes(time.timeIn)
              : 0;
          const timeOut =
            time.timeOut && typeof time.timeOut === "string"
              ? convertToMinutes(time.timeOut)
              : 0;
          const duration = timeOut - timeIn;
          if (duration > 0) groups[year].totalDuration += duration;
        });
        return groups;
      }, {});
    };

    let groupedData;
    switch (period) {
      case "daily":
        groupedData = groupByDay(filteredData);
        break;
      case "weekly":
        groupedData = groupByWeek(filteredData);
        break;
      case "monthly":
        groupedData = groupByMonth(filteredData);
        break;
      case "yearly":
        groupedData = groupByYear(filteredData);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid period.",
        });
    }

    const result = Object.values(groupedData).map((group) => ({
      period: group.day || group.week || group.period || group.year,
      totalWorkingHours: (group.totalDuration / 60).toFixed(2),
    }));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get week number from a date
const getWeekNumber = (date) => {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + 1) / 7);
};

const getWorkingHoursForWeekMonthTotal = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required.",
      });
    }

    const performanceData = await Performance.find({ user_id: userId }).select(
      "timeTracking date user_id",
    );
    // console.log("performanceData: ", performanceData);

    if (!performanceData || performanceData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No performance data found for this user.",
      });
    }

    const convertToSeconds = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes, seconds] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const startOfToday = new Date(currentDate);
    startOfToday.setHours(0, 0, 0, 0);

    startOfWeek.setHours(0, 0, 0, 0);
    currentDate.setHours(23, 59, 59, 999);

    const groupByPeriod = (data, startDate, endDate) => {
      return data.reduce(
        (groups, performance) => {
          const performanceDate = new Date(performance.date);
          performanceDate.setHours(0, 0, 0, 0);

          if (performanceDate >= startDate && performanceDate <= endDate) {
            performance.timeTracking.forEach((time) => {
              const timeIn =
                time.timeIn && typeof time.timeIn === "string"
                  ? convertToSeconds(time.timeIn)
                  : 0;
              const timeOut =
                time.timeOut && typeof time.timeOut === "string"
                  ? convertToSeconds(time.timeOut)
                  : 0;
              const duration = timeOut - timeIn;
              if (duration > 0) {
                if (!groups.totalDuration) groups.totalDuration = 0;
                groups.totalDuration += duration;
              }
            });
          }
          return groups;
        },
        { totalDuration: 0 },
      );
    };

    const todayData = groupByPeriod(performanceData, startOfToday, currentDate);
    const weeklyData = groupByPeriod(performanceData, startOfWeek, currentDate);
    const monthlyData = groupByPeriod(
      performanceData,
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      currentDate,
    );
    const totalWorkingHours = performanceData.reduce((total, performance) => {
      performance.timeTracking.forEach((time) => {
        const timeIn =
          time.timeIn && typeof time.timeIn === "string"
            ? convertToSeconds(time.timeIn)
            : 0;
        const timeOut =
          time.timeOut && typeof time.timeOut === "string"
            ? convertToSeconds(time.timeOut)
            : 0;
        const duration = timeOut - timeIn;
        if (duration > 0) total += duration;
      });
      return total;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        today: todayData.totalDuration,
        thisWeek: weeklyData.totalDuration,
        thisMonth: monthlyData.totalDuration,
        totalWorkingHours: totalWorkingHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeOfThePeriod = async (req, res, next) => {
  try {
    const { period } = req.query;
    const today = new Date();

    let startDate, endDate;

    if (period === "week") {
      const currentDayOfWeek = today.getDay();

      const startOfCurrentWeek = new Date(today);
      startOfCurrentWeek.setDate(today.getDate() - currentDayOfWeek + 1);

      const startOfPreviousWeek = new Date(startOfCurrentWeek);
      startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);

      const endOfPreviousWeek = new Date(startOfPreviousWeek);
      endOfPreviousWeek.setDate(startOfPreviousWeek.getDate() + 4);

      startDate = startOfPreviousWeek;
      endDate = endOfPreviousWeek;
    } else if (period === "month") {
      const previousMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );
      startDate = new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth(),
        1,
      );
      endDate = new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth() + 1,
        0,
      );
    } else if (period === "year") {
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use week, month, or year.",
      });
    }

    const startIsoDate = startDate.toISOString().split("T")[0];
    const endIsoDate = endDate.toISOString().split("T")[0];

    const performances = await Performance.find({
      date: { $gte: startIsoDate, $lte: endIsoDate },
    });

    if (performances.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No performance data found for this period.",
      });
    }

    const employees = await Employee.find({});

    const employeeAttendance = await Promise.all(
      employees.map(async (employee) => {
        const {
          _id,
          firstName,
          avatar,
          email,
          designation,
          designationLevel,
          employeeId,
          lastName,
          userId,
        } = employee;

        const employeePerformance = performances.filter(
          (performance) => performance.user_id.toString() === userId.toString(),
        );

        let totalWorkedSeconds = 0;
        let dailyWorkedTime = {};

        if (employeePerformance.length > 0) {
          employeePerformance.forEach((performance) => {
            if (
              performance.timeTracking &&
              performance.timeTracking.length > 0
            ) {
              performance.timeTracking.forEach((entry) => {
                const { timeIn, timeOut, date } = entry;

                if (timeIn && timeOut) {
                  const timeInDate = new Date(`1970-01-01T${timeIn}Z`);
                  const timeOutDate = new Date(`1970-01-01T${timeOut}Z`);

                  const workedSeconds = (timeOutDate - timeInDate) / 1000;

                  const entryDate = new Date(date || performance.date)
                    .toISOString()
                    .split("T")[0];

                  totalWorkedSeconds += workedSeconds;
                  if (!dailyWorkedTime[entryDate]) {
                    dailyWorkedTime[entryDate] = 0;
                  }
                  dailyWorkedTime[entryDate] += workedSeconds;
                }
              });
            }
          });
        }

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
          totalWorkedSeconds,
          dailyWorkedTime,
        };
      }),
    );

    const validEmployeeAttendance = employeeAttendance.filter(
      (employee) =>
        employee.totalWorkedSeconds > 0 &&
        Object.keys(employee.dailyWorkedTime).length > 0,
    );

    if (validEmployeeAttendance.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No employee has worked enough hours during this period.",
        employee: null,
        dailyAttendance: null,
      });
    }

    const sortedEmployeeAttendance = validEmployeeAttendance.sort(
      (a, b) => b.totalWorkedSeconds - a.totalWorkedSeconds,
    );

    const top3Employees = sortedEmployeeAttendance.slice(0, 3);
    top3Employees.forEach((employee) => {
      Object.keys(employee.dailyWorkedTime).forEach((date) => {
        if (employee.dailyWorkedTime[date] >= 20600) {
          employee.dailyWorkedTime[date];
        } else {
          // delete employee.dailyWorkedTime[date];
        }
      });
    });

    res.status(200).json({
      success: true,
      message: `Top 3 employees of the previous ${period}`,
      employees: top3Employees,
      dailyAttendance: top3Employees.map((emp) => emp.dailyWorkedTime),
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllPerformance,
  gerPerformanceByWorkingHour,
  AllEmployeeAttandance,
  EmployeeAttandanceById,
  getAttendanceByUserId,
  getHRAllPerformance,
  getAllHrAttandance,
  getWorkingHoursForWeekMonthTotal,
  getEmployeeOfThePeriod,
};
