import { Router } from "express";
import {
  createEmployeeDetails,
  getAllEmployee,
  getEmployeeByUserId,
  getEmployeeById,
  updateOneEmployee,
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
    restrictMiddleware(["admin", "hr", "employee", "manager"]),
    getAllEmployee
  );

router.route("/employee/:id")
  .get(isAuthenticated, restrictMiddleware(["admin", "hr", "employee"]), getEmployeeById)
  .patch(
    isAuthenticated,
    restrictMiddleware(["admin", "hr"]),
    updateOneEmployee
  )
  .delete(
    isAuthenticated,
    restrictMiddleware(["admin", "hr"]),
    deleteOneEmployee
  );

router.route("/employee")
  .get(isAuthenticated, restrictMiddleware(["employee"]), getEmployeeByUserId)

router.route("/employee/byuserId")
  .get(isAuthenticated, restrictMiddleware(["admin", "hr", "employee"]), getEmployeeByUserId)


router
  .route("/employee/empId/:employeeId")
  .get(isAuthenticated, getEmployeeById);

export default router;
