/**
 * Modern Timer App Logic
 * Features: Clock, Timer, Stopwatch, Theme Toggle
 */

// --- Global State ---
let activeView = 'clock';
let theme = localStorage.getItem('theme') || 'dark';

// --- View Management ---
const views = {
  clock: document.getElementById('clock-view'),
  timer: document.getElementById('timer-view'),
  stopwatch: document.getElementById('stopwatch-view')
};

const navBtns = document.querySelectorAll('.nav-btn');

function switchView(viewId) {
  Object.keys(views).forEach(key => {
    views[key].classList.toggle('active', key === viewId);
  });
  
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });
  
  activeView = viewId;
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

// --- Theme Management ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(newTheme) {
  document.body.className = `${newTheme}-theme`;
  themeIcon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
  lucide.createIcons(); // Update icons
  localStorage.setItem('theme', newTheme);
  theme = newTheme;
}

themeToggle.addEventListener('click', () => {
  applyTheme(theme === 'dark' ? 'light' : 'dark');
});

// Initialize theme
applyTheme(theme);

// --- Clock Logic ---
const timeDisplay = document.getElementById('current-time');
const dateDisplay = document.getElementById('current-date');

function updateClock() {
  const now = new Date();
  
  // Time
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  timeDisplay.textContent = `${h}:${m}:${s}`;
  
  // Date
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  dateDisplay.textContent = now.toLocaleDateString('ko-KR', options);
}

setInterval(updateClock, 1000);
updateClock();

// --- Timer Logic ---
const timerDisplay = document.getElementById('timer-display');
const timerMinInput = document.getElementById('timer-min');
const timerSecInput = document.getElementById('timer-sec');
const timerStartBtn = document.getElementById('timer-start');
const timerPauseBtn = document.getElementById('timer-pause');
const timerResetBtn = document.getElementById('timer-reset');

let timerInterval;
let timerSeconds = 0;
let isTimerRunning = false;

function updateTimerDisplay() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
  if (!isTimerRunning) {
    if (timerSeconds === 0) {
      const mins = parseInt(timerMinInput.value) || 0;
      const secs = parseInt(timerSecInput.value) || 0;
      timerSeconds = (mins * 60) + secs;
    }
    
    if (timerSeconds <= 0) return;

    isTimerRunning = true;
    timerStartBtn.classList.add('hidden');
    timerPauseBtn.classList.remove('hidden');
    
    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();
      
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerStartBtn.classList.remove('hidden');
        timerPauseBtn.classList.add('hidden');
        notify('타이머 종료!', '설정하신 시간이 다 되었습니다.');
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerStartBtn.classList.remove('hidden');
  timerPauseBtn.classList.add('hidden');
}

function resetTimer() {
  pauseTimer();
  timerSeconds = 0;
  timerMinInput.value = '';
  timerSecInput.value = '';
  updateTimerDisplay();
}

timerStartBtn.addEventListener('click', startTimer);
timerPauseBtn.addEventListener('click', pauseTimer);
timerResetBtn.addEventListener('click', resetTimer);

// --- Stopwatch Logic ---
const swDisplay = document.getElementById('stopwatch-display');
const swStartBtn = document.getElementById('sw-start');
const swPauseBtn = document.getElementById('sw-pause');
const swLapBtn = document.getElementById('sw-lap');
const swResetBtn = document.getElementById('sw-reset');
const lapList = document.getElementById('lap-list');

let swInterval;
let swStartTime;
let swElapsedTime = 0;
let isSwRunning = false;

function formatSwTime(ms) {
  const date = new Date(ms);
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  const msPart = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
  return `${m}:${s}.${msPart}`;
}

function updateSwDisplay() {
  swDisplay.textContent = formatSwTime(swElapsedTime);
}

function startStopwatch() {
  if (!isSwRunning) {
    isSwRunning = true;
    swStartTime = Date.now() - swElapsedTime;
    
    swStartBtn.classList.add('hidden');
    swPauseBtn.classList.remove('hidden');
    swLapBtn.classList.remove('hidden');
    
    swInterval = setInterval(() => {
      swElapsedTime = Date.now() - swStartTime;
      updateSwDisplay();
    }, 10);
  }
}

function pauseStopwatch() {
  clearInterval(swInterval);
  isSwRunning = false;
  swStartBtn.classList.remove('hidden');
  swPauseBtn.classList.add('hidden');
}

function resetStopwatch() {
  pauseStopwatch();
  swElapsedTime = 0;
  updateSwDisplay();
  lapList.innerHTML = '';
  swLapBtn.classList.add('hidden');
}

function addLap() {
  const lapTime = formatSwTime(swElapsedTime);
  const lapItem = document.createElement('li');
  lapItem.className = 'lap-item';
  lapItem.innerHTML = `
    <span>Lap ${lapList.children.length + 1}</span>
    <span>${lapTime}</span>
  `;
  lapList.appendChild(lapItem);
}

swStartBtn.addEventListener('click', startStopwatch);
swPauseBtn.addEventListener('click', pauseStopwatch);
swResetBtn.addEventListener('click', resetStopwatch);
swLapBtn.addEventListener('click', addLap);

// --- Notification Logic ---
function notify(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/2088/2088617.png' });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        notify(title, body);
      }
    });
  }
  // Fallback to alert if notifications not supported/denied
  if (Notification.permission !== 'granted') {
    alert(`${title}\n${body}`);
  }
}
