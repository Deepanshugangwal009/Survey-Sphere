const { Survey } = require('../models');
const { buildSurveyResults } = require('../utils/aggregate');
const { withOrderedQuestions } = require('../utils/queryHelpers');

function buildChartData(questions) {
  return questions
    .filter((result) => result.question.type !== 'short_text')
    .map((result) => {
      if (result.question.type === 'rating') {
        return {
          questionId: result.question.id,
          type: 'bar',
          labels: result.distribution.map((entry) => String(entry.value)),
          data: result.distribution.map((entry) => entry.total)
        };
      }

      return {
        questionId: result.question.id,
        type: result.question.type === 'single_choice' ? 'pie' : 'bar',
        labels: result.options.map((option) => option.text),
        data: result.options.map((option) => option.total)
      };
    });
}

exports.show = async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.survey.id, withOrderedQuestions());
    const page = Math.max(1, Number(req.query.page) || 1);
    const results = await buildSurveyResults(survey, page);
    const chartData = buildChartData(results.questions);

    res.render('surveys/results', {
      title: `Results | ${survey.title}`,
      survey,
      results,
      page,
      chartDataJson: JSON.stringify(chartData).replace(/</g, '\\u003c')
    });
  } catch (error) {
    next(error);
  }
};
