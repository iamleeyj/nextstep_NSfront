// 가격 변동이 +인지 -인지에 따라 색을 자동으로 바꿔주는 기능

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

// 초기 데이터 적용 예시
updateChangeColor('kospi-change', 12.34);
updateChangeColor('exchange-change', -5.22);
updateChangeColor('oil-change', 1.12);

// 향후 이 부분은 서버에서 실시간 데이터 받아오는 API 연동으로 대체 가능
