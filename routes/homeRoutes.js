const express = require('express');

const homeController = require('../controllers/homeController');

const router = express.Router();

router.get('/', homeController.showHome);
router.get('/about', homeController.showAbout);
router.get('/contact', homeController.showContact);

module.exports = router;
