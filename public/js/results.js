document.addEventListener('DOMContentLoaded', () => {
  const dataElement = document.getElementById('chartData');

  if (!dataElement) {
    return;
  }

  const chartColors = [
    '#0d6efd',
    '#198754',
    '#ffc107',
    '#dc3545',
    '#6f42c1',
    '#20c997',
    '#fd7e14',
    '#6c757d'
  ];

  JSON.parse(dataElement.textContent).forEach((chart) => {
    const canvas = document.getElementById(`chart-${chart.questionId}`);

    if (!canvas) {
      return;
    }

    new Chart(canvas, {
      type: chart.type,
      data: {
        labels: chart.labels,
        datasets: [
          {
            label: 'Answers',
            data: chart.data,
            backgroundColor: chart.labels.map((label, index) => chartColors[index % chartColors.length])
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: chart.type === 'pie' }
        },
        scales: chart.type === 'bar' ? { y: { beginAtZero: true, ticks: { precision: 0 } } } : {}
      }
    });
  });
});
