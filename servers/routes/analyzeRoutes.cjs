const express = require("express");
const router = express.Router();
const { analyze } = require("../controllers/analyzeController.cjs");
// const registerFreeUser = require("../middleware/registerUser.cjs");
const { getDashboardStats } = require('../controllers/dashboardController.cjs');
const { toggleSaved } = require('../controllers/dashboardController.cjs');

router.get('/dashboard-stats', getDashboardStats);
router.post("/analyze", analyze);
router.put('/saved/:analysisId', toggleSaved);

module.exports = router;