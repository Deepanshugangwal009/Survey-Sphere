const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');

const DEMO_EMAILS = ['admin@example.com', 'riya@example.com', 'arjun@example.com'];
const DEMO_SLUG = 'demo-course-feedback';

function findIds(queryInterface, table, column, values) {
  return queryInterface.sequelize.query(
    `SELECT id, ${column} AS matchValue FROM ${table} WHERE ${column} IN (:values)`,
    { replacements: { values }, type: QueryTypes.SELECT }
  );
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const password = await bcrypt.hash('secret123', 10);

    await queryInterface.bulkInsert('users', [
      { name: 'Site Admin', email: DEMO_EMAILS[0], password, role: 'admin', created_at: now, updated_at: now },
      { name: 'Riya Sharma', email: DEMO_EMAILS[1], password, role: 'user', created_at: now, updated_at: now },
      { name: 'Arjun Mehta', email: DEMO_EMAILS[2], password, role: 'user', created_at: now, updated_at: now }
    ]);

    const users = await findIds(queryInterface, 'users', 'email', DEMO_EMAILS);
    const riyaId = users.find((user) => user.matchValue === DEMO_EMAILS[1]).id;
    const arjunId = users.find((user) => user.matchValue === DEMO_EMAILS[2]).id;

    await queryInterface.bulkInsert('surveys', [
      {
        user_id: riyaId,
        title: 'Course Feedback 2026',
        description: 'Tell us how the database course went this semester.',
        status: 'published',
        share_slug: DEMO_SLUG,
        published_at: now,
        created_at: now,
        updated_at: now
      },
      {
        user_id: arjunId,
        title: 'Library Facilities Survey',
        description: 'A draft survey about the college library.',
        status: 'draft',
        created_at: now,
        updated_at: now
      }
    ]);

    const surveys = await findIds(queryInterface, 'surveys', 'title', [
      'Course Feedback 2026',
      'Library Facilities Survey'
    ]);
    const publishedId = surveys.find((survey) => survey.matchValue === 'Course Feedback 2026').id;
    const draftId = surveys.find((survey) => survey.matchValue === 'Library Facilities Survey').id;

    await queryInterface.bulkInsert('questions', [
      { survey_id: publishedId, text: 'Which topic did you enjoy the most?', type: 'single_choice', is_required: true, position: 1, created_at: now, updated_at: now },
      { survey_id: publishedId, text: 'Which tools did you use during the labs?', type: 'multiple_choice', is_required: false, position: 2, created_at: now, updated_at: now },
      { survey_id: publishedId, text: 'What should we improve next semester?', type: 'short_text', is_required: false, position: 3, created_at: now, updated_at: now },
      { survey_id: publishedId, text: 'How would you rate the course overall?', type: 'rating', is_required: true, min_value: 1, max_value: 5, position: 4, created_at: now, updated_at: now },
      { survey_id: draftId, text: 'How often do you visit the library?', type: 'single_choice', is_required: true, position: 1, created_at: now, updated_at: now }
    ]);

    const questions = await queryInterface.sequelize.query(
      'SELECT id, position FROM questions WHERE survey_id = :surveyId ORDER BY position',
      { replacements: { surveyId: publishedId }, type: QueryTypes.SELECT }
    );
    const [topicQuestion, toolsQuestion, textQuestion, ratingQuestion] = questions;

    const draftQuestion = await queryInterface.sequelize.query(
      'SELECT id FROM questions WHERE survey_id = :surveyId',
      { replacements: { surveyId: draftId }, type: QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('question_options', [
      { question_id: topicQuestion.id, text: 'Database design', position: 1, created_at: now, updated_at: now },
      { question_id: topicQuestion.id, text: 'SQL queries', position: 2, created_at: now, updated_at: now },
      { question_id: topicQuestion.id, text: 'Transactions', position: 3, created_at: now, updated_at: now },
      { question_id: toolsQuestion.id, text: 'MySQL Workbench', position: 1, created_at: now, updated_at: now },
      { question_id: toolsQuestion.id, text: 'Command line client', position: 2, created_at: now, updated_at: now },
      { question_id: toolsQuestion.id, text: 'Sequelize CLI', position: 3, created_at: now, updated_at: now },
      { question_id: draftQuestion[0].id, text: 'Every day', position: 1, created_at: now, updated_at: now },
      { question_id: draftQuestion[0].id, text: 'Once a week', position: 2, created_at: now, updated_at: now }
    ]);

    const options = await queryInterface.sequelize.query(
      'SELECT id, question_id, position FROM question_options WHERE question_id IN (:questionIds) ORDER BY question_id, position',
      {
        replacements: { questionIds: [topicQuestion.id, toolsQuestion.id] },
        type: QueryTypes.SELECT
      }
    );
    const topicOptions = options.filter((option) => option.question_id === topicQuestion.id);
    const toolOptions = options.filter((option) => option.question_id === toolsQuestion.id);

    await queryInterface.bulkInsert('responses', [
      { survey_id: publishedId, submitted_at: now, respondent_ip: '127.0.0.1', created_at: now, updated_at: now },
      { survey_id: publishedId, submitted_at: now, respondent_ip: '127.0.0.1', created_at: now, updated_at: now },
      { survey_id: publishedId, submitted_at: now, respondent_ip: '127.0.0.1', created_at: now, updated_at: now }
    ]);

    const responses = await queryInterface.sequelize.query(
      'SELECT id FROM responses WHERE survey_id = :surveyId ORDER BY id',
      { replacements: { surveyId: publishedId }, type: QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('answers', [
      { response_id: responses[0].id, question_id: topicQuestion.id, option_id: topicOptions[1].id, created_at: now, updated_at: now },
      { response_id: responses[0].id, question_id: toolsQuestion.id, option_id: toolOptions[0].id, created_at: now, updated_at: now },
      { response_id: responses[0].id, question_id: toolsQuestion.id, option_id: toolOptions[2].id, created_at: now, updated_at: now },
      { response_id: responses[0].id, question_id: textQuestion.id, text_value: 'More time for the transaction examples.', created_at: now, updated_at: now },
      { response_id: responses[0].id, question_id: ratingQuestion.id, rating_value: 5, created_at: now, updated_at: now },

      { response_id: responses[1].id, question_id: topicQuestion.id, option_id: topicOptions[1].id, created_at: now, updated_at: now },
      { response_id: responses[1].id, question_id: toolsQuestion.id, option_id: toolOptions[1].id, created_at: now, updated_at: now },
      { response_id: responses[1].id, question_id: ratingQuestion.id, rating_value: 4, created_at: now, updated_at: now },

      { response_id: responses[2].id, question_id: topicQuestion.id, option_id: topicOptions[0].id, created_at: now, updated_at: now },
      { response_id: responses[2].id, question_id: textQuestion.id, text_value: 'The labs were well organised.', created_at: now, updated_at: now },
      { response_id: responses[2].id, question_id: ratingQuestion.id, rating_value: 4, created_at: now, updated_at: now }
    ]);
  },

  async down(queryInterface) {
    const users = await findIds(queryInterface, 'users', 'email', DEMO_EMAILS);

    if (users.length > 0) {
      await queryInterface.bulkDelete('users', { id: users.map((user) => user.id) });
    }
  }
};
