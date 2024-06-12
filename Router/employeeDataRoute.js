import { Router } from "express";
import {
  createEmployeeDetails,
  getAllEmployee,
  getEmployeeById,
  deleteOneEmployee
} from "../Controllers/employeeDataController.js";

import { isAuthenticated } from "../middleware/auth.js";
import { restrictMiddleware } from "../middleware/restrictMiddleware.js";

const router = Router();

router
  .route("/employee/new")
  .post(
    isAuthenticated,
    restrictMiddleware(["admin", "hr"]),
    createEmployeeDetails
  );

router
  .route("/employees")
  .get(
    isAuthenticated,
    restrictMiddleware(["admin", "hr", "employee"]),
    getAllEmployee
  );

router.route("/employee/byId/:id")
  .get(isAuthenticated, getEmployeeById)
  .delete(
    isAuthenticated,
    restrictMiddleware(["admin","hr","employee"]),
    deleteOneEmployee
  );
router
  .route("/employee/empId/:employeeId")
  .get(isAuthenticated, getEmployeeById);

export default router;
