const express = require('express');

const questionController = require('../controllers/questionController');
const { isAuthenticated } = require('../middleware/auth');
const { loadOwnedSurvey, loadOwnedQuestion, requireDraftSurvey } = require('../middleware/ownership');

const router = express.Router();

const forOwnedSurvey = [isAuthenticated, loadOwnedSurvey, requireDraftSurvey];
const forOwnedQuestion = [isAuthenticated, loadOwnedQuestion, requireDraftSurvey];

router.get('/surveys/:id/questions/new', forOwnedSurvey, questionController.showCreate);
router.post('/surveys/:id/questions', forOwnedSurvey, questionController.create);

router.get('/questions/:id/edit', forOwnedQuestion, questionController.showEdit);
router.put('/questions/:id', forOwnedQuestion, questionController.update);
router.delete('/questions/:id', forOwnedQuestion, questionController.destroy);

module.exports = router;
