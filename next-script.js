document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('stockChart').getContext('2d');

  // 날짜 생성 함수
  function generateLabels(days, unit = '일 전', step = 1) {
    // days: 전체 일수, unit: 라벨 단위 텍스트, step: 라벨 간격
    const labels = [];
    for (let i = days; i >= 1; i -= step) {
      labels.push(`${i}${unit}`);
    }
    return labels;
  }

  // 임시 데이터 생성 함수
  function generateData(length, base = 60000, variance = 10000) {
    return Array.from({ length }, () => Math.floor(base + Math.random() * variance));
  }

  // 필터별 데이터 및 라벨 세팅
  const filterData = {
    '15일 전': {
      labels: generateLabels(15, '일 전', 1),
      data: generateData(15),
    },
    '한달 전': {
      // 한달은 30일, 3일 단위로 라벨 표시 (예: 30일 전, 27일 전, 24일 전 ...)
      labels: generateLabels(30, '일 전', 3),
      data: generateData(10),
    },
    '일년 전': {
      // 1년은 365일, 한 달 단위(약 30일)로 라벨 표시 (예: 12개월 전, 11개월 전 ...)
      labels: Array.from({ length: 12 }, (_, i) => `${12 - i}개월 전`),
      data: generateData(12, 60000, 20000),
    }
  };

  // 초기 차트 생성 (기본은 15일 전 데이터)
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: filterData['15일 전'].labels,
      datasets: [{
        label: '주가 (₩)',
        data: filterData['15일 전'].data,
        borderColor: '#60a5fa',
        fill: false,
        tension: 0.2,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: value => value.toLocaleString(), // 천 단위 콤마 표시
          }
        }
      }
    }
  });

  // 종목 선택 및 필터 버튼 DOM
  const stockTable = document.querySelector('.stock-table tbody');
  const filterButtons = document.querySelectorAll('.filter button');
  const graphTitle = document.querySelector('.graph-box .box-title');

  // 현재 선택 상태 저장
  let selectedStock = null;
  let selectedFilter = '15일 전';

  // 필터 버튼 클릭 이벤트
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 단일 선택 유지
      filterButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');

      const filter = button.textContent.trim();
      selectedFilter = filter;

      // 차트 데이터와 라벨 업데이트
      const { labels, data } = filterData[filter] || filterData['15일 전'];
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;

      // 종목이 선택되어 있으면, 데이터 베이스를 약간 변경 (랜덤)
      if (selectedStock) {
        chart.data.datasets[0].data = data.map(v => Math.floor(v * (0.9 + Math.random() * 0.2)));
      }

      chart.update();
    });
  });

  // 초기 필터 버튼 '15일 전' 선택 표시
  filterButtons.forEach(btn => {
    if (btn.textContent.trim() === '15일 전') btn.classList.add('selected');
  });

  // 종목 선택 이벤트
  stockTable.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;

    // 단일 선택 유지
    const prevSelected = stockTable.querySelector('tr.selected');
    if (prevSelected) prevSelected.classList.remove('selected');
    row.classList.add('selected');

    selectedStock = row.children[0].textContent;
    graphTitle.textContent = selectedStock;

    // 필터 기준 데이터 가져오기
    const { labels, data } = filterData[selectedFilter] || filterData['15일 전'];

    // 종목별로 데이터를 약간 변형해서 넣기 (예시: 랜덤 변동)
    chart.data.labels = labels;
    chart.data.datasets[0].data = data.map(v => Math.floor(v * (0.9 + Math.random() * 0.2)));

    chart.update();
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
