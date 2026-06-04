//=====테마 토글 및 동기화 (다크 모드 / 라이트 모드)=====
function initTheme() {
  const toggle = document.getElementById('icon-toggle')
  if (!toggle) return

  //저장된 테마 불러오기 (기본값은 라이트 모드)
  const savedTheme = localStorage.getItem('theme_v3')
  if (savedTheme === 'dark') {
    toggle.checked = true
  } else if (savedTheme === 'light') {
    toggle.checked = false
  }

  //테마 상태 변경 시 저장
  toggle.addEventListener('change', () => {
    localStorage.setItem('theme_v3', toggle.checked ? 'dark' : 'light')
  })
}

// DOM 로드가 완료되었거나 이미 완료된 경우 실행
if (document.readyState !== 'loading') {
  initTheme()
} else {
  document.addEventListener('DOMContentLoaded', initTheme)
}

// ===== 탭 전환 =====
function showGame(id) {
  document
    .querySelectorAll('section')
    .forEach((s) => s.classList.remove('active'))
  document
    .querySelectorAll('nav button')
    .forEach((b) => b.classList.remove('active-nav'))
  document.getElementById(id).classList.add('active')
  document.getElementById('nav-' + id).classList.add('active-nav')
}

// =========================
// 틱택토 게임
// =========================

let board = ['', '', '', '', '', '', '', '', '']
let gameOver = false

function drawBoard() {
  const boardDiv = document.getElementById('board')
  boardDiv.innerHTML = ''
  board.forEach((value, index) => {
    const cell = document.createElement('button')
    cell.className = 'cell'
    cell.innerText = value
    if (value === 'O') cell.classList.add('cell-o')
    if (value === 'X') cell.classList.add('cell-x')
    cell.onclick = () => playerMove(index)
    boardDiv.appendChild(cell)
  })
}

function playerMove(index) {
  if (board[index] !== '' || gameOver) return
  board[index] = 'O'
  if (checkWinner('O')) {
    document.getElementById('ticResult').innerText = '사용자 승리!'
    gameOver = true
    drawBoard()
    return
  }
  if (isDraw()) {
    document.getElementById('ticResult').innerText = '무승부!'
    gameOver = true
    drawBoard()
    return
  }
  aiMove()
  if (checkWinner('X')) {
    document.getElementById('ticResult').innerText = 'AI 승리!'
    gameOver = true
  } else if (isDraw()) {
    document.getElementById('ticResult').innerText = '무승부!'
    gameOver = true
  }
  drawBoard()
}

function aiMove() {
  let move = findBestMove('X')
  if (move === -1) move = findBestMove('O')
  if (move === -1) {
    const emptyCells = board
      .map((v, i) => (v === '' ? i : null))
      .filter((v) => v !== null)
    move = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  }
  board[move] = 'X'
}

function findBestMove(player) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = player
      if (checkWinner(player)) {
        board[i] = ''
        return i
      }
      board[i] = ''
    }
  }
  return -1
}

function checkWinner(player) {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  return wins.some((p) => p.every((i) => board[i] === player))
}

function isDraw() {
  return board.every((c) => c !== '')
}

function resetTicTacToe() {
  board = ['', '', '', '', '', '', '', '', '']
  gameOver = false
  document.getElementById('ticResult').innerText = ''
  drawBoard()
}

// =========================
// 숫자 맞추기 게임
// =========================

let answer = Math.floor(Math.random() * 100) + 1
let count = 0

function checkGuess() {
  const guess = Number(document.getElementById('guessInput').value)
  const result = document.getElementById('numberResult')
  if (!guess || guess < 1 || guess > 100) {
    result.innerText = '1부터 100 사이 숫자를 입력하세요.'
    return
  }
  count++
  if (guess === answer) {
    result.innerText = `정답입니다! ${count}번 만에 맞췄어요.`
  } else if (guess < answer) {
    result.innerText = 'UP! 더 큰 숫자입니다.'
  } else {
    result.innerText = 'DOWN! 더 작은 숫자입니다.'
  }
}

function resetNumberGame() {
  answer = Math.floor(Math.random() * 100) + 1
  count = 0
  document.getElementById('guessInput').value = ''
  document.getElementById('numberResult').innerText = ''
}
