// アプリの状態
let timeboxes = [];
let isRunning = false;
let startTime = null;
let currentTime = null;
let currentDetail = '';
let timer = null;

// DOM要素
const lapButton = document.getElementById('lapButton');
const timerDisplay = document.getElementById('timerDisplay');
const currentTimeEl = document.getElementById('currentTime');
const currentDetailEl = document.getElementById('currentDetail');
const timeboxList = document.getElementById('timeboxList');
const searchInput = document.getElementById('searchInput');
const clearButton = document.getElementById('clearButton');

// 初期化
function init() {
  loadTimeboxes();
  setupEventListeners();
  renderTimeboxes();
  updateClearButtonVisibility();
}

// データの読み込み
function loadTimeboxes() {
  const savedTimeboxes = localStorage.getItem('timeboxes');
  if (savedTimeboxes) {
    try {
      const parsed = JSON.parse(savedTimeboxes);
      timeboxes = parsed.map(box => ({
        ...box,
        timeA: box.timeA ? new Date(box.timeA) : null,
        timeC: box.timeC ? new Date(box.timeC) : null
      }));
    } catch (e) {
      console.error('データの復元に失敗しました', e);
    }
  }
}

// データの保存
function saveTimeboxes() {
  localStorage.setItem('timeboxes', JSON.stringify(timeboxes));
}

// イベントリスナーのセットアップ
function setupEventListeners() {
  lapButton.addEventListener('click', handleLapClick);
  currentDetailEl.addEventListener('input', (e) => {
    currentDetail = e.target.value;
  });
  searchInput.addEventListener('input', renderTimeboxes);
  clearButton.addEventListener('click', clearAll);
}

// ラップボタンクリック
function handleLapClick() {
  const now = new Date();
  
  if (!isRunning) {
    // タイマーを開始
    isRunning = true;
    startTime = now;
    currentTime = now;
    lapButton.textContent = 'ラップ';
    timerDisplay.classList.remove('hidden');
    startTimer();
  } else {
    // ラップを記録
    const newTimebox = {
      id: Date.now(),
      timeA: startTime,
      timeC: now,
      detail: currentDetail,
      timeD: now - startTime
    };
    timeboxes.unshift(newTimebox);
    saveTimeboxes();
    startTime = now;
    currentDetail = '';
    currentDetailEl.value = '';
    renderTimeboxes();
    updateClearButtonVisibility();
  }
}

// タイマー開始
function startTimer() {
  timer = setInterval(() => {
    currentTime = new Date();
    updateTimerDisplay();
  }, 100);
}

// タイマー表示の更新
function updateTimerDisplay() {
  if (isRunning && startTime && currentTime) {
    currentTimeEl.textContent = formatDuration(currentTime - startTime);
  }
}

// タイムボックスのレンダリング
function renderTimeboxes() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredTimeboxes = timeboxes.filter(box => 
    box.detail.toLowerCase().includes(searchTerm)
  );
  
  if (filteredTimeboxes.length === 0) {
    timeboxList.innerHTML = '<li class="empty-message">ラップボタンを押して記録を開始しましょう</li>';
    return;
  }
  
  timeboxList.innerHTML = '';
  filteredTimeboxes.forEach(box => {
    const li = document.createElement('li');
    li.className = 'timebox-item';
    
    const header = document.createElement('div');
    header.className = 'timebox-header';
    
    const date = document.createElement('span');
    date.className = 'timebox-date';
    date.textContent = formatDate(box.timeA);
    
    const timeA = document.createElement('span');
    timeA.textContent = formatTime(box.timeA);
    
    const arrow = document.createElement('span');
    arrow.className = 'time-arrow';
    arrow.textContent = '→';
    
    const timeC = document.createElement('span');
    timeC.textContent = formatTime(box.timeC);
    
    const duration = document.createElement('span');
    duration.className = 'timebox-duration';
    duration.textContent = formatDuration(box.timeD);
    
    header.appendChild(date);
    header.appendChild(timeA);
    header.appendChild(arrow);
    header.appendChild(timeC);
    header.appendChild(duration);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'timebox-detail-input';
    input.placeholder = '詳細を入力（タップして編集）';
    input.value = box.detail;
    input.addEventListener('input', (e) => {
      box.detail = e.target.value;
      saveTimeboxes();
    });
    
    li.appendChild(header);
    li.appendChild(input);
    timeboxList.appendChild(li);
  });
}

// 全てクリア
function clearAll() {
  if (confirm('すべての記録を削除しますか？')) {
    timeboxes = [];
    localStorage.removeItem('timeboxes');
    renderTimeboxes();
    updateClearButtonVisibility();
  }
}

// クリアボタンの表示/非表示更新
function updateClearButtonVisibility() {
  clearButton.style.display = timeboxes.length > 0 ? 'block' : 'none';
}

// フォーマット関数
function formatDate(date) {
  if (!date) return '';
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTime(date) {
  if (!date) return '';
  return date.toTimeString().substr(0, 8);
}

function formatDuration(ms) {
  if (!ms) return '';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}時間${minutes}分${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
}

// PWAインストールガイドの表示
function showInstallGuide() {
  const hasShownInstallGuide = localStorage.getItem('hasShownInstallGuide');
  if (!hasShownInstallGuide && isInstallable()) {
    alert('このアプリはホーム画面に追加できます。ブラウザのメニューから「ホーム画面に追加」を選択してください。');
    localStorage.setItem('hasShownInstallGuide', 'true');
  }
}

// PWAのインストール可能性チェック
function isInstallable() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return isMobile && !isStandalone;
}

// アプリの初期化
document.addEventListener('DOMContentLoaded', () => {
  init();
  showInstallGuide();
});
