import { Router } from "express";

const router = Router()

import { authenticate } from "../controllers/authenticateController.js";
import {isAuthenticated} from "../middleware/auth.js";
router.route('/').get(isAuthenticated,authenticate);

export default router