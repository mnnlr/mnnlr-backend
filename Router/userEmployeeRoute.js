import { Router } from "express";
import {
  createUser,
  getAllUsers,
} from "../Controllers/userEmployeeController.js";

const router = Router();

router.route("/user/new").post(createUser);
router.route("/allusers").get(getAllUsers);

export default router;
