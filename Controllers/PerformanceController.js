import Performance from "../Models/PerformanceModel.js";
import calculateTotalWorkingHours from "../utils/calculateWorkinHours.js";
import { ErrorHandler } from "../utils/errorHendler.js";

const getAllPerformance = async (req, res, next) => {
  try {
    const performance = await Performance.find({}).populate({
      path: "employeeDocId",
      select:
        "firstName lastName avatar designation designationLevel employeeId",
    });

    res.status(200).json({ success: true, performance });
  } catch (error) {
    next(error);
  }
};

const AllEmployeeAttandance = async (req, res) => {
  try {
    const performances = await Performance.find({})
      .populate({
        path: "employeeDocId",
        select:
          "firstName lastName avatar designation designationLevel employeeId",
      })
      .lean();

    const attendanceByEmployee = {};

    const period = "today";

    for (let performance of performances) {
      const {
        hours,
        minutes,
        seconds,
        LoginTime,
        logoutTime,
        totalMilliseconds,
      } = await calculateTotalWorkingHours(performance, period);
      let totalWorkingHours = "";

      if (hours === 0 && minutes === 0 && seconds === 0) {
        totalWorkingHours = null;
      } else {
        totalWorkingHours = `${hours}:${minutes}:${seconds}`;
      }

      const employeeId = performance.employeeDocId._id;

      if (!attendanceByEmployee[employeeId]) {
        attendanceByEmployee[employeeId] = {
          employee: performance.employeeDocId,
          totalWorkingHours: totalWorkingHours,
          LoginTime,
          logoutTime,
          totalMilliseconds,
        };
      } else {
        attendanceByEmployee[employeeId].totalWorkingHours = totalWorkingHours;
      }
    }

    const attendanceArray = Object.values(attendanceByEmployee);

    res.status(200).json({ success: true, attendance: attendanceArray });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const EmployeeAttandanceById = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (employeeId === undefined)
      return res
        .status(404)
        .json({ success: false, message: "data not found" });

    const performance = await Performance.findOne({
      employeeDocId: employeeId,
    })
      .populate({
        path: "employeeDocId",
        select:
          "firstName lastName avatar designation designationLevel employeeId",
      })
      .lean();

    if (!performance)
      return res
        .status(404)
        .json({ success: false, message: "data not found" });

    // const attendanceByEmployee = {};

    const period = "today";

    const {
      hours,
      minutes,
      seconds,
      LoginTime,
      logoutTime,
      totalMilliseconds,
    } = await calculateTotalWorkingHours(performance, period);
    let totalWorkingHours = "";

    if (hours === 0 && minutes === 0 && seconds === 0) {
      totalWorkingHours = null;
    } else {
      totalWorkingHours = `${hours}:${minutes}:${seconds}`;
    }

    // const employeeData = performance.employeeDocId._id;

    const attendanceByEmployee = {
      // employee: performance.employeeDocId,
      totalWorkingHours: totalWorkingHours,
      LoginTime,
      logoutTime,
      // totalMilliseconds,
    };

    res.status(200).json({ success: true, attendance: attendanceByEmployee });
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
