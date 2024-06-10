import { Router } from "express";
import {
  createCompanyDetails,
  getCompanyDetails,
} from "../Controllers/companyController.js";

const router = Router();

router.post("/company/new", createCompanyDetails);
router.get("/companies", getCompanyDetails);

export default router;
