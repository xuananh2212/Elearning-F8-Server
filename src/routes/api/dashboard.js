const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/api/dashboard.controller");
router.get("/dashboard-total", dashboardController.getDashboardStats);

module.exports = router;
