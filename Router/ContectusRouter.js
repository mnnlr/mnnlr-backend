import { Router } from "express";

const router = Router();

import { contectus } from "../Controllers/Contectus.js";

router.route("/contact").post(contectus);

export default router;
