import { Router } from "express";

const router = Router();

import {
  getAllPerformance,
  gerPerformanceByWorkingHour,
  AllEmployeeAttandance,
  EmployeeAttandanceById,
  getAttendanceByUserId,
  getHRAllPerformance,
  getAllHrAttandance,
  getWorkingHoursForWeekMonthTotal,
  getEmployeeOfThePeriod,
} from "../Controllers/PerformanceController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { restrictMiddleware } from "../middleware/restrictMiddleware.js";

router
  .route("/")
  .get(
    // isAuthenticated, restrictMiddleware(["admin", "hr"]), 
    getAllPerformance
  );
router
  .route("/rank")
  .get(
    isAuthenticated,
    restrictMiddleware(["admin", "hr"]),
    gerPerformanceByWorkingHour
  );
router
  .route("/attendance")
  .get(
    isAuthenticated,
    restrictMiddleware(["admin", ,"hr"]),
    AllEmployeeAttandance
  );
router.route("/attendance/:id").get(
  isAuthenticated,
  restrictMiddleware(["admin", "hr"]),
  EmployeeAttandanceById
);

router.route("/attendance/detail/:userId").get(
  isAuthenticated,
  restrictMiddleware(["admin", "hr"]),
  getAttendanceByUserId)

router.route("/Hr/performance").get(
  getHRAllPerformance,
  isAuthenticated,
  restrictMiddleware(["admin", "hr"]),
)
router.route("/Hr/attendance").get(
  getAllHrAttandance,
  isAuthenticated,
  restrictMiddleware(["admin", "hr"]),
)

router.route("/workingHours/:userId").get(
  isAuthenticated,
  restrictMiddleware(["employee"]),
  getWorkingHoursForWeekMonthTotal
)

router.route('/employeeoftheperiod').get(
  isAuthenticated,
  restrictMiddleware(["admin"]),
  getEmployeeOfThePeriod
)

export default router;
