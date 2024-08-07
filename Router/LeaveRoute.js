import { Router } from "express";
const router = Router();

import {
  getAllLeaveRequest,
  leaveRequest,
  getLeaveRequestById,
  approveLeaveRequest,
} from "../Controllers/LeaveController.js";
import { isAuthenticated } from "../middleware/auth.js";
import { restrictMiddleware } from "../middleware/restrictMiddleware.js";

router
  .route("/")
  .get(/*isAuthenticated, restrictMiddleware(["admin", "hr"]),*/ getAllLeaveRequest)
  .post(isAuthenticated,restrictMiddleware(["admin", "hr","employee"]), leaveRequest);
router
  .route("/:id")
  .get(isAuthenticated, getLeaveRequestById)
  .put(
    isAuthenticated,
    restrictMiddleware(["admin", "hr"]),
    approveLeaveRequest
  );

export default router;
