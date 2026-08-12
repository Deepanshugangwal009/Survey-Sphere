const { QueryTypes } = require('sequelize');

const { sequelize, Response } = require('../models');

const TEXT_PAGE_SIZE = 10;

function toPercentage(count, total) {
  if (!total) {
    return 0;
  }
  return Math.round((count * 1000) / total) / 10;
}

function countOptionSelections(surveyId) {
  return sequelize.query(
    `SELECT o.question_id AS questionId, o.id AS optionId, o.text AS text, COUNT(a.id) AS total
     FROM question_options o
     JOIN questions q ON q.id = o.question_id
     LEFT JOIN answers a ON a.option_id = o.id
     WHERE q.survey_id = :surveyId
     GROUP BY o.question_id, o.id, o.text, o.position
     ORDER BY o.question_id, o.position`,
    { replacements: { surveyId }, type: QueryTypes.SELECT }
  );
}

function summariseRatings(surveyId) {
  return sequelize.query(
    `SELECT a.question_id AS questionId, COUNT(*) AS total, AVG(a.rating_value) AS average,
            MIN(a.rating_value) AS lowest, MAX(a.rating_value) AS highest
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE q.survey_id = :surveyId AND a.rating_value IS NOT NULL
     GROUP BY a.question_id`,
    { replacements: { surveyId }, type: QueryTypes.SELECT }
  );
}

function countRatingValues(surveyId) {
  return sequelize.query(
    `SELECT a.question_id AS questionId, a.rating_value AS ratingValue, COUNT(*) AS total
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE q.survey_id = :surveyId AND a.rating_value IS NOT NULL
     GROUP BY a.question_id, a.rating_value
     ORDER BY a.question_id, a.rating_value`,
    { replacements: { surveyId }, type: QueryTypes.SELECT }
  );
}

function countTextAnswers(surveyId) {
  return sequelize.query(
    `SELECT a.question_id AS questionId, COUNT(*) AS total
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE q.survey_id = :surveyId AND a.text_value IS NOT NULL
     GROUP BY a.question_id`,
    { replacements: { surveyId }, type: QueryTypes.SELECT }
  );
}

function listTextAnswers(questionId, page) {
  return sequelize.query(
    `SELECT a.text_value AS textValue, r.submitted_at AS submittedAt
     FROM answers a
     JOIN responses r ON r.id = a.response_id
     WHERE a.question_id = :questionId AND a.text_value IS NOT NULL
     ORDER BY r.submitted_at DESC, a.id DESC
     LIMIT :limit OFFSET :offset`,
    {
      replacements: {
        questionId,
        limit: TEXT_PAGE_SIZE,
        offset: (page - 1) * TEXT_PAGE_SIZE
      },
      type: QueryTypes.SELECT
    }
  );
}

function buildChoiceResult(question, optionRows) {
  const options = optionRows
    .filter((row) => row.questionId === question.id)
    .map((row) => ({ text: row.text, total: Number(row.total) }));
  const answered = options.reduce((sum, option) => sum + option.total, 0);

  return {
    options: options.map((option) => ({
      ...option,
      percentage: toPercentage(option.total, answered)
    })),
    answered
  };
}

function buildRatingResult(question, summaryRows, valueRows) {
  const summary = summaryRows.find((row) => row.questionId === question.id);
  const counts = valueRows.filter((row) => row.questionId === question.id);
  const answered = summary ? Number(summary.total) : 0;

  const distribution = [];
  for (let value = question.minValue; value <= question.maxValue; value += 1) {
    const match = counts.find((row) => Number(row.ratingValue) === value);
    const total = match ? Number(match.total) : 0;
    distribution.push({ value, total, percentage: toPercentage(total, answered) });
  }

  return {
    answered,
    average: summary ? Number(Number(summary.average).toFixed(2)) : 0,
    lowest: summary ? Number(summary.lowest) : 0,
    highest: summary ? Number(summary.highest) : 0,
    distribution
  };
}

async function buildSurveyResults(survey, page) {
  const [totalResponses, optionRows, ratingSummaries, ratingValues, textCounts] = await Promise.all([
    Response.count({ where: { surveyId: survey.id } }),
    countOptionSelections(survey.id),
    summariseRatings(survey.id),
    countRatingValues(survey.id),
    countTextAnswers(survey.id)
  ]);

  let totalTextPages = 1;

  const questions = await Promise.all(
    survey.questions.map(async (question) => {
      const result = { question };

      if (question.type === 'single_choice' || question.type === 'multiple_choice') {
        Object.assign(result, buildChoiceResult(question, optionRows));
      } else if (question.type === 'rating') {
        Object.assign(result, buildRatingResult(question, ratingSummaries, ratingValues));
      } else {
        const match = textCounts.find((row) => row.questionId === question.id);
        const answered = match ? Number(match.total) : 0;
        const pages = Math.max(1, Math.ceil(answered / TEXT_PAGE_SIZE));
        totalTextPages = Math.max(totalTextPages, pages);
        result.answered = answered;
        result.textAnswers = answered > 0 ? await listTextAnswers(question.id, page) : [];
      }

      return result;
    })
  );

  return { totalResponses, questions, totalTextPages };
}

module.exports = { buildSurveyResults };
