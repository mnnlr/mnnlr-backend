import { Router } from "express";

import {
  EmployeeRegistration,
  loginLogout,
} from "../Controllers/employeeRegistrationController.js";

const router = Router();

router.put("/employee/update", EmployeeRegistration);
router.post("/employee/login", loginLogout);

export default router;
