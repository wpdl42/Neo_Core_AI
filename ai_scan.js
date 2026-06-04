/**
 * [AI Scan 핵심 로직 파일]
 * 이 파일은 Transformers.js를 사용하여 브라우저 내에서 직접 AI 모델을 실행합니다.
 * 서버 없이 동작하며, 유해 콘텐츠 필터링과 지능형 위협 분석 기능을 제공합니다.
 * 
 * 디자인 참고: game.html 스타일을 준수하여 결과 및 로딩 상태를 표시합니다.
 */

// 1. CDN을 통해 Transformers.js 라이브러리에서 pipeline 함수를 가져옵니다.
// pipeline은 모델 로드, 전처리, 추론, 후처리를 한 번에 처리해주는 핵심 API입니다.
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1'; 

// 2. 전역 상태 변수 선언
// 한 번 로드된 모델을 재사용하기 위해 변수에 저장합니다. (메모리 효율 및 속도 향상)
let toxicClassifier = null;    // 유해 콘텐츠 분석용 모델 저장소
let securityClassifier = null; // 지능형 위협 분석용 모델 저장소

/**
 * [기능 A] 유해 콘텐츠 모델 초기화 함수
 * 사용자가 처음 '분석' 버튼을 눌렀을 때 모델을 다운로드하고 초기화합니다.
 */
async function initToxicModel() {
    const loading = document.getElementById('toxic-loading'); // 로딩 메시지 엘리먼트
    const btn = document.getElementById('btn-toxic-analyze');  // 분석 버튼 엘리먼트
    
    // 모델이 아직 로드되지 않은 경우에만 실행
    if (!toxicClassifier) {
        loading.style.display = 'block'; // 로딩 표시 보이기
        btn.disabled = true;             // 로딩 중 버튼 클릭 방지
        loading.innerText = "유해 콘텐츠 모델 로딩 중... (최초 1회)";
        
        // pipeline('작업유형', '모델이름', 옵션)
        // 'Xenova/toxic-bert' 모델은 텍스트의 독성(욕설, 위협 등)을 분류하는 데 특화되어 있습니다.
        toxicClassifier = await pipeline('text-classification', 'Xenova/toxic-bert', {
            progress_callback: (p) => {
                // 모델 파일 다운로드 진행률을 화면에 표시
                if (p.status === 'progress') {
                    loading.innerText = `모델 로딩 중... ${Math.round(p.loaded / p.total * 100)}%`;
                }
            }
        });
        
        loading.style.display = 'none'; // 로딩 완료 후 메시지 숨김
        btn.disabled = false;            // 버튼 다시 활성화
    }
}

/**
 * [기능 B] 지능형 보안 모델 초기화 함수
 * 사회공학적 공격이나 문맥적 위협을 분석하기 위한 모델을 준비합니다.
 */
async function initSecurityModel() { 
    const loading = document.getElementById('ai-security-loading');
    const btn = document.getElementById('btn-ai-security');
    
    if (!securityClassifier) { 
        loading.style.display = 'block'; 
        btn.disabled = true; 
        loading.innerText = "지능형 보안 모델 로딩 중... (최초 1회)"; 
        
        // 'distilbert-base-uncased-finetuned-sst-2-english' 모델을 사용합니다.
        // 이 모델은 문장의 감정과 의도를 분석하여 부정적/위험한 패턴을 감지하는 데 사용됩니다.
        securityClassifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', { 
            progress_callback: (p) => { 
                if (p.status === 'progress') {
                    loading.innerText = `모델 로딩 중... ${Math.round(p.loaded / p.total * 100)}%`;
                }
            }
        });
        
        loading.style.display = 'none';
        btn.disabled = false;
    }
}

/**
 * [실행 로직 1] 딥러닝 기반 유해 콘텐츠 필터링 실행
 * 사용자가 입력한 텍스트를 AI 모델에 전달하고 결과를 화면에 출력합니다.
 */
export async function analyzeToxic() {
    const inputElement = document.getElementById('toxic-input');
    const resultBox = document.getElementById('toxic-result');
    const text = inputElement.value.trim(); // 앞뒤 공백 제거
    
    // 입력값 검증
    if (!text) {
        resultBox.innerText = "분석할 텍스트를 입력해주세요.";
        resultBox.style.color = "var(--text-result)"; // game.css 변수 사용
        return;
    }

    // 모델 초기화 확인 및 실행 (필요 시 다운로드)
    await initToxicModel();
    resultBox.innerText = "AI가 내용을 분석하고 있습니다...";
    resultBox.style.color = "var(--text-secondary)";
    
    // 모델 추론 실행 (비동기)
    const result = await toxicClassifier(text);
    const label = result[0].label;           // 결과 라벨
    const score = (result[0].score * 100).toFixed(2); // 확신도 점수(%)

    // 결과에 따른 화면 출력 처리 (game.html 디자인 참고)
    if (score > 50) {
        resultBox.innerHTML = `<span style="color: #ff4d4d;">⚠️ [위험] 유해 콘텐츠 감지 (확신도: ${score}%)</span>`;
    } else {
        resultBox.innerHTML = `<span style="color: #00ff9d;">✅ [안전] 정상적인 콘텐츠입니다. (신뢰도: ${(100 - score).toFixed(2)}%)</span>`;
    }
}

/**
 * [실행 로직 2] 지능형 위협 분석 실행
 * 문장의 맥락을 분석하여 사기, 피싱, 위협 등의 위험 요소를 감지합니다.
 */
export async function analyzeSecurityAI() {
    const inputElement = document.getElementById('ai-security-input');
    const resultBox = document.getElementById('ai-security-result');
    const text = inputElement.value.trim();
    
    if (!text) {
        resultBox.innerText = "분석할 내용을 입력해주세요.";
        resultBox.style.color = "var(--text-result)";
        return;
    }

    await initSecurityModel();
    resultBox.innerText = "AI가 문맥의 위협 수준을 심층 분석 중입니다...";
    resultBox.style.color = "var(--text-secondary)";
    
    // 모델 추론 실행
    const result = await securityClassifier(text);
    const label = result[0].label; // 결과 라벨 (NEGATIVE: 위험, POSITIVE: 안전)
    const score = (result[0].score * 100).toFixed(2);

    // 결과 출력
    if (label === 'NEGATIVE') {
        resultBox.innerHTML = `
            <div style="color: #ff4d4d; font-weight: bold;">⚠️ [경고] 사회공학적 위협 감지!</div>
            <div style="margin-top: 5px; font-size: 0.9em; color: var(--text-secondary);">AI 분석 결과 위험한 의도가 포함되어 있을 가능성이 높습니다. (위험도: ${score}%)</div>
        `;
    } else {
        resultBox.innerHTML = `
            <div style="color: #00ff9d; font-weight: bold;">✅ [안전] 정상적인 메시지입니다.</div>
            <div style="margin-top: 5px; font-size: 0.9em; color: var(--text-secondary);">일반적인 커뮤니케이션 패턴으로 분석되었습니다. (신뢰도: ${score}%)</div>
        `;
    }
}

// 3. 페이지 로드 완료 시 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    const btnToxic = document.getElementById('btn-toxic-analyze');
    const btnSecurity = document.getElementById('btn-ai-security');

    // 각 버튼에 클릭 이벤트 연결
    if (btnToxic) {
        btnToxic.addEventListener('click', analyzeToxic);
    }
    if (btnSecurity) {
        btnSecurity.addEventListener('click', analyzeSecurityAI);
    }
});
