import express from "express";
// import { registerValidator, loginValidator } from "../utils/validator.js";
const router = express.Router();
import { restrictMiddleware } from "../middleware/restrictMiddleware.js";
import { isAuthenticated } from "../middleware/auth.js";

import {
  getAllUser,
  userRegister,
  userLogin,
  LogOut,
  userUpdate,
} from "../Controllers/user-controller.js";

router.get("/api/v1/users", getAllUser);
router.patch("/api/v1/update-user/:userId",
  // isAuthenticated,
  // restrictMiddleware(["admin", "hr", "manager"]),
  userUpdate
);
router.post("/api/v1/register", /*registerValidator,*/ userRegister);
router.post("/api/v1/logout",/*registerValidator,*/ LogOut);
router.post("/api/v1/login",/*loginValidator,*/ userLogin);

export default router;