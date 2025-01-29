import Router from "express";
import { verifyEmp } from "../Controllers/verifyEmpController.js";

const router = Router();

router.get("/", verifyEmp);

export default router;
