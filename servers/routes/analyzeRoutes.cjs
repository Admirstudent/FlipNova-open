const express = require("express");
const router = express.Router();
const { analyze } = require("../controllers/analyzeController.cjs");
// const registerFreeUser = require("../middleware/registerUser.cjs");
const { getDashboardStats } = require('../controllers/dashboardController.cjs');

router.get('/dashboard-stats', getDashboardStats);
router.post("/analyze", analyze);

module.exports = router;