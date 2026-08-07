const { Question, QuestionOption } = require('../models');

function withOrderedQuestions() {
  return {
    include: [
      {
        model: Question,
        as: 'questions',
        include: [{ model: QuestionOption, as: 'options' }]
      }
    ],
    order: [
      [{ model: Question, as: 'questions' }, 'position', 'ASC'],
      [{ model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'position', 'ASC']
    ]
  };
}

module.exports = { withOrderedQuestions };
