const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/api/dashboard.controller");
router.get("/dashboard-total", dashboardController.getDashboardStats);
router.get("/chart-data", dashboardController.getDashboardChartData);
router.get(
  "/dashboard-total/teacher/:teacherId",
  dashboardController.getTeacherStatistics
);
module.exports = router;
