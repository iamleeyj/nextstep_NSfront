document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('stockChart').getContext('2d');

  function generateCandleData(count) {
    const data = [];
    let base = 60000;
    for (let i = 0; i < count; i++) {
      const open = base + Math.floor(Math.random() * 2000 - 1000);
      const close = open + Math.floor(Math.random() * 2000 - 1000);
      const high = Math.max(open, close) + Math.floor(Math.random() * 1000);
      const low = Math.min(open, close) - Math.floor(Math.random() * 1000);
      base = close;
      data.push({ x: i, o: open, h: high, l: low, c: close });
    }
    return data;
  }

  function generatePrediction(data) {
    return data.map((d, i) => ({
      x: i + data.length,
      o: d.o * 1.01,
      h: d.h * 1.02,
      l: d.l * 0.98,
      c: d.c * 1.03
    }));
  }

  const datasetsByFilter = {
    '7일 전': {
      past: generateCandleData(7),
      future: generatePrediction(generateCandleData(7)),
      xLabels: ['7일전', '기준선', '7일후'],
      unit: '일'
    },
    '한달 전': {
      past: generateCandleData(15),
      future: generatePrediction(generateCandleData(15)),
      xLabels: ['한달전', '기준선', '한달후'],
      unit: '달'
    },
    '일년 전': {
      past: generateCandleData(180),
      future: generatePrediction(generateCandleData(180)),
      xLabels: ['일년전', '기준선', '일년후'],
      unit: '년'
    }
  };

  let currentFilter = '7일 전';

  const chart = new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [
        {
          label: '과거 주가',
          data: datasetsByFilter[currentFilter].past,
          borderColor: '#3b82f6',
          color: {
            up: '#3b82f6',
            down: '#ef4444',
            unchanged: '#999'
          }
        },
        {
          label: '예측 주가',
          data: datasetsByFilter[currentFilter].future,
          borderColor: '#facc15',
          color: {
            up: '#facc15',
            down: '#fde68a',
            unchanged: '#fcd34d'
          }
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: context => {
              const d = context.raw;
              return [
                `날짜: ${context.dataIndex + 1}${datasetsByFilter[currentFilter].unit}`,
                `시작가 (Open): ₩${d.o.toLocaleString()}`,
                `최고가 (High): ₩${d.h.toLocaleString()}`,
                `최저가 (Low): ₩${d.l.toLocaleString()}`,
                `마감가 (Close): ₩${d.c.toLocaleString()}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          ticks: {
            callback: val => {
              const total = datasetsByFilter[currentFilter].past.length;
              const totalFuture = datasetsByFilter[currentFilter].future.length;
              const totalLength = total + totalFuture;
              if (val === 0) return datasetsByFilter[currentFilter].xLabels[0];
              if (val === total) return datasetsByFilter[currentFilter].xLabels[1];
              if (val === totalLength - 1) return datasetsByFilter[currentFilter].xLabels[2];
              return '';
            },
            maxRotation: 0,
            autoSkip: false
          },
          title: {
            display: true,
            text: `${datasetsByFilter[currentFilter].unit}`,
            color: '#666',
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          beginAtZero: false,
          ticks: {
            callback: value => `₩${value.toLocaleString()}`,
            color: '#333'
          },
          title: {
            display: true,
            text: '가격 (원)',
            color: '#666',
            font: { size: 14, weight: 'bold' }
          }
        }
      }
    }
  });

  const stockTable = document.querySelector('.stock-table tbody');
  const filterButtons = document.querySelectorAll('.filter button');
  const graphTitle = document.querySelector('.graph-box .box-title');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.textContent.trim();
      if (!datasetsByFilter[filter]) return;
      currentFilter = filter;

      chart.data.datasets[0].data = datasetsByFilter[filter].past;
      chart.data.datasets[1].data = datasetsByFilter[filter].future;
      chart.options.scales.x.title.text = datasetsByFilter[filter].unit;
      chart.update();

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  filterButtons.forEach(btn => {
    if (btn.textContent.trim() === currentFilter) btn.classList.add('active');
  });

  stockTable.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      const stockName = row.children[0].textContent;
      const priceText = row.children[1].textContent.replace(/,/g, '');
      const price = Number(priceText);
      graphTitle.textContent = stockName;
      const rate = (Math.random() * 0.2 - 0.1).toFixed(2);
      updatePredictionResult(rate, price);
    });
  });

  const lineCtx = document.getElementById('linePrediction').getContext('2d');

  let lineChart = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 7 }, (_, i) => `D+${i+1}`),
      datasets: [{
        label: '예상 주가',
        data: Array(7).fill(null),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.3)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#f59e0b'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: v => `₩${Math.round(v).toLocaleString()}`
          },
          title: {
            display: true,
            text: '가격 (원)'
          }
        },
        x: {
          title: {
            display: true,
            text: '예측 기간 (일)'
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `예상 가격: ₩${Math.round(ctx.parsed.y).toLocaleString()}`
          }
        }
      }
    }
  });

  function updatePredictionResult(rate, basePrice) {
    const percentSpan = document.querySelector('.percent-widget .percent');
    const percentValue = (rate * 100).toFixed(0);
    if (rate >= 0) {
      percentSpan.textContent = `+${percentValue}%`;
      percentSpan.classList.remove('down');
      percentSpan.classList.add('up');
    } else {
      percentSpan.textContent = `${percentValue}%`;
      percentSpan.classList.remove('up');
      percentSpan.classList.add('down');
    }

    const predictedData = [];
    for (let i = 1; i <= 7; i++) {
      predictedData.push(basePrice * (1 + rate * i / 7));
    }

    lineChart.data.datasets[0].data = predictedData;
    lineChart.update();
  }

  updatePredictionResult(0.62, 65400);
});

// 시간
function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function updateTimeNotification() {
  const now = new Date();
  const year = now.getFullYear();
  const month = padZero(now.getMonth() + 1);
  const date = padZero(now.getDate());
  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yYear = yesterday.getFullYear();
  const yMonth = padZero(yesterday.getMonth() + 1);
  const yDate = padZero(yesterday.getDate());

  const timeNotification = document.getElementById('timeNotification');
  if (!timeNotification) return;

  timeNotification.innerHTML = `
    현재 시간: ${year}-${month}-${date} ${hours}:${minutes}:${seconds} <br>
    모든 데이터는 어제 날짜인 <strong>${yYear}-${yMonth}-${yDate}</strong> 기준입니다.
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  updateTimeNotification();
  setInterval(updateTimeNotification, 1000);
});
