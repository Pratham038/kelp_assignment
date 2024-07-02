const express = require('express');
const router = express.Router();
const csvController = require('../controllers/csvController');

router.get('/upload-csv', csvController.convertAndUploadCSV);

module.exports = router;
