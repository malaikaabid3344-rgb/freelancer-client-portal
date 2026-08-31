const express = require('express');
const router = express.Router();
const { getEarningsReport, getProjectsReport, getClientsReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/earnings', getEarningsReport);
router.get('/projects', getProjectsReport);
router.get('/clients', getClientsReport);

module.exports = router;
