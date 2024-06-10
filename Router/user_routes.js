import express from "express";
import { registerValidator, loginValidator } from "../utils/validator.js";
const router = express.Router();

import {
  getAllUser,
  userRegister,
  userLogin,
  LogOut,
} from "../Controllers/user-controller.js";

router.get("/api/v1/users", getAllUser);
router.post("/api/v1/register", /*registerValidator,*/ userRegister);
router.post("/api/v1/logout",/*registerValidator,*/ LogOut);
router.post("/api/v1/login",/*loginValidator,*/ userLogin);

export default router;
