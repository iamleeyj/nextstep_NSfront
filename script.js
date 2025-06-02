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

// 향후 API 연동 구조 예시
document.addEventListener('DOMContentLoaded', () => {
  // 종목 클릭 시 그래프 갱신 (기능 예시)
  const stockTable = document.querySelector('.stock-table tbody');
  stockTable.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const stockName = row.children[0].textContent;
    document.querySelector('.graph-box .box-title').textContent = stockName;
  });
});

/* 시간 */
function padZero(num) {
  return num < 10 ? '0' + num : num;
}

function updateTimeNotification() {
  const now = new Date();

  // 현재 날짜 및 시간
  const year = now.getFullYear();
  const month = padZero(now.getMonth() + 1);
  const date = padZero(now.getDate());
  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());

  // 어제 날짜 계산
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
