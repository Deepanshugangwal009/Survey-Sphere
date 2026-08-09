const express = require('express');

const questionController = require('../controllers/questionController');
const { isAuthenticated } = require('../middleware/auth');
const { loadOwnedSurvey, loadOwnedQuestion } = require('../middleware/ownership');

const router = express.Router();

router.use(isAuthenticated);

router.get('/surveys/:id/questions/new', loadOwnedSurvey, questionController.showCreate);
router.post('/surveys/:id/questions', loadOwnedSurvey, questionController.create);

router.get('/questions/:id/edit', loadOwnedQuestion, questionController.showEdit);
router.put('/questions/:id', loadOwnedQuestion, questionController.update);
router.delete('/questions/:id', loadOwnedQuestion, questionController.destroy);

module.exports = router;
