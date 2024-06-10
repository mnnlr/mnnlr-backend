import { Router } from "express";

const router = Router();

import {
  getAllPerformance,
  gerPerformanceByWorkingHour,
  AllEmployeeAttandance,
  EmployeeAttandanceById,
} from "../Controllers/PerformanceController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { restrictMiddleware } from "../middleware/restrictMiddleware.js";

router
  .route("/")
  .get(isAuthenticated, restrictMiddleware(["admin", "hr"]), getAllPerformance);
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
router.route("/attendance/:employeeId").get(
  // isAuthenticated,
  // restrictMiddleware(["admin", "hr", "employee"]),
  EmployeeAttandanceById
);

export default router;
