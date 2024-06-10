import { Router } from "express";
import {
  createVisitor,
  getuserDatails,
} from "../Controllers/visitorController.js";

const router = Router();

router.route("/visite").post(createVisitor);
router.route("/get-ip").get(getuserDatails);

export default router;
