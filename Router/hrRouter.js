import express from "express";
import { hrTeamById } from "../Controllers/hrController.js";

const router = express.Router();

router.route("/hrTeamById/:id").get(hrTeamById);

export default router;
