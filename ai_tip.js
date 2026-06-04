
function showTip(id) {
  // 1. 모든 <section> 태그에서 'active' 클래스를 제거하여 화면에서 숨김
  document
    .querySelectorAll('main section')
    .forEach((s) => s.classList.remove('active'));
  
  // 2. 모든 상단 버튼에서 'active-nav' 클래스를 제거하여 하이라이트 해제
  document
    .querySelectorAll('header.game-header button')
    .forEach((b) => b.classList.remove('active-nav'));
  
  // 3. 사용자가 클릭한 'tip' 섹션에 'active' 클래스를 추가하여 화면에 표시
  document.getElementById(id).classList.add('active');
  
  // 4. 클릭한 버튼(id="nav-tip")에 'active-nav' 클래스를 추가하여 불이 들어오게 함
  document.getElementById('nav-' + id).classList.add('active-nav');
}

function showTip2(id) {
  // 1. 모든 <section> 태그에서 'active' 클래스를 제거하여 화면에서 숨김
  document
    .querySelectorAll('main section')
    .forEach((s) => s.classList.remove('active'));
  
  // 2. 모든 상단 버튼에서 'active-nav' 클래스를 제거하여 하이라이트 해제
  document
    .querySelectorAll('header.game-header button')
    .forEach((b) => b.classList.remove('active-nav'));
  
  // 3. 사용자가 클릭한 'tip2' 섹션에 'active' 클래스를 추가하여 화면에 표시
  document.getElementById(id).classList.add('active');
  
  // 4. 클릭한 버튼(id="nav-tip2")에 'active-nav' 클래스를 추가하여 불이 들어오게 함
  document.getElementById('nav-' + id).classList.add('active-nav');
}

function copyContent(id) {
  // id에 맞는 본문 상자(div)를 가져옵니다 (text-tip 또는 text-tip2)
  const textContainer = document.getElementById('text-' + id);
  
  if (!textContainer) return;

  // div 안의 글자들을 가져옵니다.
  const textToCopy = textContainer.innerText;

  // 클립보드 API를 사용해 복사를 진행합니다.
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // 복사가 성공하면 브라우저에 알림창을 띄웁니다.
      alert('본문 내용이 클립보드에 복사되었습니다! 필요한 곳에 붙여넣기(Ctrl+V) 하세요.');
    })
    .catch((err) => {
      console.error('복사 실패: ', err);
      alert('복사에 실패했습니다. 브라우저 보안 설정을 확인해주세요.');
    });
}

// 페이지가 처음 새로고침되어 켜졌을 때, 첫 번째 탭인 'AI 활용 공부법'이 자동으로 뜨도록 설정합니다.
document.addEventListener('DOMContentLoaded', () => {
  // 처음 열릴 때 showTip 함수를 호출하여 'tip' 섹션을 기본 활성화시킵니다.
  showTip('tip');
});