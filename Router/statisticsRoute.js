import { Router } from "express";
import { getPieChartsData } from "../Controllers/statisticsController.js";
// import { adminOnly } from "../middlewares/auth.js";
// import {
//   getBarCharts,
//   getDashboardStats,
//   getLineCharts,
//   getPieCharts,
// } from "../Controllers/statisticsController.js";

// // route - /api/v1/dashboard/stats
// app.get("/stats", adminOnly, getDashboardStats);

// // // route - /api/v1/dashboard/pie
// app.get("/pie", adminOnly, getPieCharts);

// // // route - /api/v1/dashboard/bar
// app.get("/bar", adminOnly, getBarCharts);

// // // route - /api/v1/dashboard/line
// app.get("/line", adminOnly, getLineCharts);

const router = Router();

router.route("/getPieChart").get(getPieChartsData);

export default router;
