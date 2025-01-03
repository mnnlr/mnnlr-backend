import { Router } from "express";

const router = Router();

import {
  getAllPerformance,
  gerPerformanceByWorkingHour,
  AllEmployeeAttandance,
  EmployeeAttandanceById,
  getAttendanceByUserId,
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
    restrictMiddleware(["admin", "hr"]),
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

export default router;