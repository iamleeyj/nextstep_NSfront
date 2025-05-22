// [기능]가격 변동이 +인지 -인지에 따라 색을 자동으로 바꿔줌

function updateChangeColor(id, value) {
  const element = document.getElementById(id);
  const floatValue = parseFloat(value);
  if (floatValue > 0) {
    element.textContent = `+${floatValue.toFixed(2)}`;
    element.classList.add('up');
    element.classList.remove('down');
  } else if (floatValue < 0) {
    element.textContent = `${floatValue.toFixed(2)}`;
    element.classList.add('down');
    element.classList.remove('up');
  } else {
    element.textContent = floatValue.toFixed(2);
    element.classList.remove('up', 'down');
  }
}

// [예시]초기 데이터
updateChangeColor('kospi-change', 12.34);
updateChangeColor('exchange-change', -5.22);
updateChangeColor('oil-change', 1.12);

// 향후 이 부분은 서버에서 실시간 데이터 받아오는 API 연동으로 대체 가능!!

// [기능]그래프 띄우기
async function loadChartData(widgetId, jsonPath) {
  const res = await fetch(jsonPath);
  const data = await res.json();
  const prices = data.prices;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min;

  const widget = document.getElementById(widgetId);
  const canvas = document.createElement('canvas');
  canvas.width = 140;
  canvas.height = 40;
  canvas.style.marginTop = '10px';
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.moveTo(0, 40 - ((prices[0] - min) / range) * 40);

  prices.forEach((price, i) => {
    const x = (i / (prices.length - 1)) * canvas.width;
    const y = 40 - ((price - min) / range) * 40;
    ctx.lineTo(x, y);
  });

  const color = prices[prices.length - 1] >= prices[0] ? '#10b981' : '#ef4444'; // green or red
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  widget.appendChild(canvas);
}

// 호출 예시
loadChartData('kospi-widget', 'data/kospi.json');
loadChartData('exchange-widget', 'data/exchange.json');
loadChartData('oil-widget', 'data/oil.json');

