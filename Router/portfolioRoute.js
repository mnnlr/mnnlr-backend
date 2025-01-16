import { Router } from "express";
import {
  createPortfolioDetails,
  getPortFolioDetails,
} from "../Controllers/portfolioController.js";

const router = Router();

router.post("/portfolio/new", createPortfolioDetails);
router.get("/portfolios", getPortFolioDetails);

export default router;
