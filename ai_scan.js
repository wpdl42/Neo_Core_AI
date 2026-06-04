/**
 * [AI Scan 핵심 로직 파일]
 * Transformers.js를 사용하여 브라우저 내에서 직접 AI 모델을 실행
 * 서버 없이 동작.
 */

// 1. CDN을 통해 Transformers.js 라이브러리에서 pipeline 함수 가져오기
// pipeline은 모델 로드, 전처리, 추론, 후처리를 한 번에 처리해주는 핵심 API
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';  // Transformers.js 라이브러리에서 pipeline 함수 가져오기

// 2. 전역 상태 변수 선언
// 한 번 로드된 모델을 재사용하기 위해 변수에 저장.
let toxicClassifier = null;    // 유해 콘텐츠 분석용 모델 저장소
let securityClassifier = null; // 지능형 위협 분석용 모델 저장소

/**===========================
 * 유해 콘텐츠 모델 초기화 함수
 * 처음 '분석' 버튼을 눌렀을 때 모델을 다운로드하고 초기화
 */
async function initToxicModel() {                               // 모델이 이미 로드되어 있으면 재사용, 그렇지 않으면 로딩 시작
    const loading = document.getElementById('toxic-loading');   // 로딩 메시지 요소 불러오기
    const btn = document.getElementById('btn-toxic-analyze');   // 분석 버튼 요소 불러오기
    
    
    if (!toxicClassifier) {                   // 모델이 아직 로드되지 않은 경우에만 실행
        loading.style.display = 'block';     // 로딩 표시 보이기
        btn.disabled = true;                // 로딩 중 버튼 클릭 방지
        loading.innerText = "유해 콘텐츠 모델 로딩 중... (최초 1회)"; //해당 메시지로 로딩 상태 안내
        

                            // pipeline('작업유형', '모델이름', 옵션)
        toxicClassifier = await pipeline('text-classification', 'Xenova/toxic-bert', { 
                                                             // 'Xenova/toxic-bert' 모델은 텍스트의 독성(욕설, 위협 등)을 분류하는 데 특화
            progress_callback: (p) => {                      // 모델 파일 다운로드 진행 상황을 콜백으로 받아서 화면에 표시
                if (p.status === 'progress') {               //모델 로딩 상태가 "progress"일 때만 안쪽 코드를 실행하여
                    loading.innerText = `모델 로딩 중... ${Math.round(p.loaded / p.total * 100)}%`; //현재 로딩된 양 계산 및 출력
                } 
            }
        });
        
        loading.style.display = 'none'; // 로딩 완료 후 메시지 숨김
        btn.disabled = false;           // 버튼 다시 활성화
    }
}

/**==========================
 * 지능형 보안 모델 초기화 함수
 * 사기, 피싱, 위협 등 사회공학적 위험 요소를 감지하는 모델
 */
async function initSecurityModel() {                                    //보안 분석 모델을 초기화하는 비동기 함수 정의
    const loading = document.getElementById('ai-security-loading');     //로딩 메시지 영역 가져오기 (모델 로딩 상태를 표시할 영역)
    const btn = document.getElementById('btn-ai-security');             //보안 분석 버튼 가져오기 (사용자가 클릭할 버튼 요소)
    

    if (!securityClassifier) {                                      // 보안 분석 모델이 아직 준비되지 않았으면
        loading.style.display = 'block';                            // 로딩 메시지 영역 가져와서 모델 로딩 중임을 보여준다
        btn.disabled = true;                                        // 보안 분석 버튼을 비활성화해서 사용자가 모델 준비가 끝나기 전에는 클릭할 수 없도록 한다
        loading.innerText = "지능형 보안 모델 로딩 중... (최초 1회)"; 
        

        // 'distilbert-base-uncased-finetuned-sst-2-english' 모델을 사용
        // 이 모델은 문장의 의도를 분석하여 부정적/위험한 패턴을 감지하는 데 사용
        securityClassifier = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', { 
            progress_callback: (p) => {                 // 모델 파일 다운로드 진행 상황을 콜백으로 받아서 화면에 표시
                if (p.status === 'progress') {          //모델 로딩 상태가 "progress"일 때만 안쪽 코드를 실행하여
                    loading.innerText = `모델 로딩 중... ${Math.round(p.loaded / p.total * 100)}%`; //현재 로딩된 양 계산 및 출력
                }
            }
        });
        
        loading.style.display = 'none'; // 로딩 완료 후 메시지 숨김
        btn.disabled = false;           // 버튼 다시 활성화
    }
}

/**
 * [실행 로직 1] 딥러닝 기반 유해 콘텐츠 필터링 실행
 * 사용자가 입력한 텍스트를 AI 모델에 전달하고 결과를 화면에 출력
 */
export async function analyzeToxic() {                              // 유해 콘텐츠 분석을 수행하는 비동기 함수 정의
    const inputElement = document.getElementById('toxic-input');    // 사용자 입력창 가져오기
    const resultBox = document.getElementById('toxic-result');      // 결과 표시 영역 가져오기
    const text = inputElement.value.trim();                         // 입력값을 가져오고 앞뒤 공백 제거
    
    // 입력값 검증
    if (!text) {                                                // 입력이 없을 때 처리
        resultBox.innerText = "분석할 텍스트를 입력해주세요.";    // 결과 표시 영역에 안내 메시지를 출력 (사용자가 입력하지 않았을 때 보여줌)
        resultBox.style.color = "var(--text-result)";           // 결과 메시지의 글자 색상을 지정된 CSS 변수 색상으로 변경
        return;
    }

    // 모델 초기화 확인 및 실행 (필요 시 다운로드)
    await initToxicModel();                                      // 모델이 이미 로드되어 있으면 재사용, 그렇지 않으면 로딩 시작
    resultBox.innerText = "AI가 내용을 분석하고 있습니다...";     //  결과 표시 영역에 "분석 중"이라는 안내 메시지를 출력 (사용자에게 현재 진행 상황을 알려줌)
    resultBox.style.color = "var(--text-secondary)";            //  결과 메시지의 글자 색상을 보조 색상으로 변경 (시각적으로 상태를 구분)
    

    // 모델 추론 실행 (비동기)
    const result = await toxicClassifier(text); 
    //toxicClassifier(text) → 입력된 텍스트(text)를 유해성(욕설, 혐오 표현, 공격적 언어 등) 여부로 분석하는 함수
    //await → toxicClassifier가 비동기 함수이므로, 결과가 반환될 때까지 기다린 뒤 result 변수에 저장
    //const result → 분석된 결과(예: 유해성 점수, 판별 여부 등)를 담는 변수


    const label = result[0].label;                       // 결과 라벨
    const score = (result[0].score * 100).toFixed(2);    // 확신도 점수(%)


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
export async function analyzeSecurityAI() {                             //보안 분석을 수행하는 비동기 함수 정의
    const inputElement = document.getElementById('ai-security-input'); //사용자 입력창 가져오기
    const resultBox = document.getElementById('ai-security-result'); //결과 표시 영역 가져오기
    const text = inputElement.value.trim();                         //입력값을 가져오고 앞뒤 공백 제거
    

    if (!text) {                                            //입력값이 없을 경우 안내 메시지 출력 후 함수 종료
        resultBox.innerText = "분석할 내용을 입력해주세요."; //결과 영역에 텍스트 메시지 표시
        resultBox.style.color = "var(--text-result)";      //결과 영역의 글자 색상 변경
        return;                                            
    }

    await initSecurityModel();                                           //보안 분석 모델 초기화 (비동기 처리)
    resultBox.innerText = "AI가 문맥의 위협 수준을 심층 분석 중입니다..."; //결과 영역에 텍스트 메시지 표시
    resultBox.style.color = "var(--text-secondary)";                    //결과 영역의 글자 색상 변경
    
    // 모델 추론 실행
    const result = await securityClassifier(text);      // 입력된 텍스트를 보안 분석 모델에 전달하고 결과를 받아옴 (비동기 처리)
    const label = result[0].label;                      // 분석 결과 중 첫 번째 항목의 라벨을 가져옴 (예: NEGATIVE → 위험, POSITIVE → 안전)
    const score = (result[0].score * 100).toFixed(2);   // 분석 결과의 신뢰도 점수를 백분율로 변환하고 소수점 둘째 자리까지 표시

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
document.addEventListener('DOMContentLoaded', () => {               //DOMContentLoaded → 문서 준비 완료 시 실행
                                                                    //getElementById → 버튼 가져오기
    const btnToxic = document.getElementById('btn-toxic-analyze');  //[유해성 분석] 버튼 가져오기
    const btnSecurity = document.getElementById('btn-ai-security'); //[보안 분석] 버튼 가져오기

    // 각 버튼에 클릭 이벤트 연결
    if (btnToxic) {                                         //이 버튼이 존재할 경우
        btnToxic.addEventListener('click', analyzeToxic);   //addEventListener('click', …) → 버튼 클릭 시 특정 함수 실행
                                                            //analyzeToxic → 유해성 분석
    }
    if (btnSecurity) {                                              //이 버튼이 존재할 경우
        btnSecurity.addEventListener('click', analyzeSecurityAI);   //analyzeSecurityAI → 보안 분석
    }
});
