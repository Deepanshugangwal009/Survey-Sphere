const express = require('express');

const surveyController = require('../controllers/surveyController');
const { isAuthenticated } = require('../middleware/auth');
const { loadOwnedSurvey } = require('../middleware/ownership');

const router = express.Router();

router.use(isAuthenticated);

router.get('/', surveyController.index);
router.get('/new', surveyController.showCreate);
router.post('/', surveyController.create);
router.get('/:id', loadOwnedSurvey, surveyController.show);
router.get('/:id/edit', loadOwnedSurvey, surveyController.showEdit);
router.put('/:id', loadOwnedSurvey, surveyController.update);
router.post('/:id/publish', loadOwnedSurvey, surveyController.publish);
router.post('/:id/close', loadOwnedSurvey, surveyController.close);
router.post('/:id/reopen', loadOwnedSurvey, surveyController.reopen);
router.delete('/:id', loadOwnedSurvey, surveyController.destroy);

module.exports = router;
