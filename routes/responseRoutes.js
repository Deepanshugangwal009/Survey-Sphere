const express = require('express');

const responseController = require('../controllers/responseController');

const router = express.Router();

router.get('/:slug', responseController.showSurvey);
router.post('/:slug', responseController.submit);
router.get('/:slug/thank-you', responseController.showThankYou);

module.exports = router;
