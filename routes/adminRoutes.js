const express = require('express');

const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get('/', adminController.showDashboard);
router.get('/users', adminController.listUsers);
router.get('/surveys', adminController.listSurveys);
router.delete('/users/:id', adminController.destroyUser);
router.delete('/surveys/:id', adminController.destroySurvey);

module.exports = router;
