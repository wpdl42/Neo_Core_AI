// 탭 전환 기능
function showTheory(id) {
  // 모든 섹션 숨기기
  document.querySelectorAll('.theory-section').forEach((section) => {
    section.classList.remove('active');
  });

  // 모든 버튼 비활성화
  document.querySelectorAll('.theory-btn').forEach((button) => {
    button.classList.remove('active-nav');
  });

  // 선택한 섹션 표시
  document.getElementById(id).classList.add('active');

  // 선택한 버튼 활성화
  document.getElementById('nav-' + id).classList.add('active-nav');
}

// 기본 화면 설정
document.addEventListener('DOMContentLoaded', () => {
  showTheory('history');
});