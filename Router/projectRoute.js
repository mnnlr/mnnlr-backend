import { Router } from "express";
import {
  createNewProject,
  getAllProjects,
  deleteProject,
} from "../Controllers/projectController.js";

const router = Router();

router.route("/project/new").post(createNewProject);
router.route("/projects").get(getAllProjects);
router.route("/project/:id").delete(deleteProject);

export default router;
