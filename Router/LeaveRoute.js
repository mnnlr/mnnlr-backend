import { Router } from "express";
const router = Router();

import {
  getAllLeaves,
  getAllLeaveRequest,
  leaveRequest,
  getLeaveRequestById,
  getAllLeavesForHr,
  approveLeaveRequest,
} from "../Controllers/LeaveController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { restrictMiddleware } from "../middleware/restrictMiddleware.js";

router.route("/")
  .get(/*isAuthenticated, restrictMiddleware(["admin", "hr"]),*/ getAllLeaves);

router.route('/EmpLeavesForHr/:id')
  .get(getAllLeavesForHr)

router
  .route("/leave-request")
  .get(/*isAuthenticated, restrictMiddleware(["admin", "hr"]),*/ getAllLeaveRequest)
  .post(isAuthenticated, restrictMiddleware(["admin", "hr", "employee"]), leaveRequest);
router
  .route("/:id")
  .get(isAuthenticated, getLeaveRequestById)
  .put(
    isAuthenticated,
    restrictMiddleware(["admin", "hr"]),
    approveLeaveRequest
  );

export default router;
