import { addReservation, getReservations } from './storage.js';

// ===== State =====
let userName = '';
let userPhone = '';

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const holidays = {
  fixed: ['01-01', '03-01', '05-05', '06-06', '08-15', '10-03', '10-09', '12-25'],
  '2025': ['01-28', '01-29', '01-30', '05-05', '05-06'],
  '2026': ['02-16', '02-17', '02-18', '05-24', '09-24', '09-25', '09-26'],
  '2027': ['02-05', '02-06', '02-07', '05-13', '10-13', '10-14', '10-15'],
};

function isHoliday(date) {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const year = String(date.getFullYear());
  return holidays.fixed.includes(mmdd) || (holidays[year] && holidays[year].includes(mmdd));
}

function isDateDisabled(date) {
  const day = date.getDay();
  return day === 0 || day === 6 || isHoliday(date);
}

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let selectedDate = new Date(currentYear, currentMonth, today.getDate());
while (isDateDisabled(selectedDate)) {
  selectedDate.setDate(selectedDate.getDate() + 1);
}
currentYear = selectedDate.getFullYear();
currentMonth = selectedDate.getMonth();
let selectedTime = null;

// ===== URL Query Parameter 수신 (캘린더에서 날짜 클릭 시) =====
const params = new URLSearchParams(window.location.search);
const dateParam = params.get('date');
if (dateParam) {
  const [y, m, d] = dateParam.split('-').map(Number);
  const paramDate = new Date(y, m - 1, d);
  if (!isDateDisabled(paramDate)) {
    selectedDate = paramDate;
    currentYear = y;
    currentMonth = m - 1;
  }
}

const baseTimeSlots = [
  '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00',
];

// ===== Page Navigation =====
window.showPage = function(page) {
  document.getElementById('pageIntro').classList.toggle('hidden', page !== 'intro');
  document.getElementById('pageBooking').classList.toggle('hidden', page !== 'booking');

  if (page === 'booking') {
    document.getElementById('displayName').textContent = userName;
    document.getElementById('displayPhone').textContent = userPhone || '없음';
    document.getElementById('timeSlotDate').textContent = selectedDate
      ? formatDate(selectedDate)
      : '날짜를 선택하세요';
    renderCalendar();
    renderTimeSlots();
  }
};

// ===== Intro Page =====
const nameInput = document.getElementById('nameInput');
const nameClear = document.getElementById('nameClear');
const homeForm = document.getElementById('homeForm');

nameInput.addEventListener('input', () => {
  nameClear.style.display = nameInput.value ? 'block' : 'none';
});

nameClear.addEventListener('click', () => {
  nameInput.value = '';
  nameClear.style.display = 'none';
  nameInput.focus();
});

homeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  userName = nameInput.value.trim();
  userPhone = document.getElementById('phoneInput').value.replace(/-/g, '');
  if (userName && userPhone) {
    showPage('booking');
  }
});

// ===== Calendar =====
function formatDate(d) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${dayNames[d.getDay()]}요일`;
}

function formatDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderCalendar() {
  const cal = document.getElementById('calendar');
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

  let html = `
    <div class="calendar-header">
      <div class="calendar-title">${monthNames[currentMonth]} ${currentYear}</div>
      <div class="calendar-nav">
        <button onclick="prevMonth()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
        <button onclick="nextMonth()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
    </div>
    <div class="calendar-weekdays">
      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
    </div>
    <div class="calendar-days">`;

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<button class="calendar-day outside" disabled>${daysInPrev - i}</button>`;
  }

  const todayDate = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(currentYear, currentMonth, d);
    const disabled = isDateDisabled(thisDate);
    let cls = 'calendar-day';
    if (disabled) cls += ' outside';
    else if (selectedDate && selectedDate.getTime() === thisDate.getTime()) cls += ' selected';
    else if (todayDate.getFullYear() === currentYear && todayDate.getMonth() === currentMonth && todayDate.getDate() === d) cls += ' today';
    html += `<button class="${cls}" ${disabled ? 'disabled' : `onclick="selectDate(${currentYear},${currentMonth},${d})"`}>${d}</button>`;
  }

  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<button class="calendar-day outside" disabled>${i}</button>`;
  }

  html += '</div>';
  cal.innerHTML = html;
}

window.prevMonth = function() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
};

window.nextMonth = function() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
};

window.selectDate = function(y, m, d) {
  selectedDate = new Date(y, m, d);
  currentYear = y;
  currentMonth = m;
  selectedTime = null;
  renderCalendar();
  document.getElementById('timeSlotDate').textContent = formatDate(selectedDate);
  renderTimeSlots();
};

// ===== Busy Times (LocalStorage 기반) =====
function isTimeBusy(timeStr, date) {
  const dateStr = formatDateStr(date);
  const reservations = getReservations();
  return reservations.some(r => {
    if (r.date !== dateStr) return false;
    const startTime = r.time.split('~')[0].trim();
    return startTime === timeStr;
  });
}

// ===== Time Slots =====
function renderTimeSlots() {
  const container = document.getElementById('timeSlots');
  container.innerHTML = baseTimeSlots
    .map((time) => {
      const available = !isTimeBusy(time, selectedDate);
      const isSelected = selectedTime === time;
      if (!available) {
        return `<div class="time-slot-row">
          <button class="time-slot-btn unavailable" disabled>${time}</button>
          <div class="time-slot-next visible unavailable">
            <button disabled>예약됨</button>
          </div>
        </div>`;
      }
      return `
        <div class="time-slot-row">
          <button class="time-slot-btn ${isSelected ? 'selected' : ''}" onclick="selectTime('${time}')">${time}</button>
          <div class="time-slot-next visible ${isSelected ? '' : 'placeholder'}">
            <button ${isSelected ? 'onclick="goToForm()"' : 'disabled'}>${isSelected ? '다음' : '예약'}</button>
          </div>
        </div>`;
    })
    .join('');
}

window.selectTime = function(time) {
  selectedTime = time;
  renderTimeSlots();
};

// ===== Booking Steps =====
function showStep(step) {
  document.getElementById('stepSelect').classList.toggle('hidden', step !== 'select');
  document.getElementById('stepForm').classList.toggle('hidden', step !== 'form');
  document.getElementById('stepSuccess').classList.toggle('hidden', step !== 'success');
  document.getElementById('backBtn').classList.toggle('hidden', step !== 'form');

  const left = document.getElementById('bookingLeft');
  left.classList.toggle('form-step', step !== 'select');

  const dt = document.getElementById('selectedDatetime');
  if ((step === 'form' || step === 'success') && selectedTime && selectedDate) {
    dt.classList.remove('hidden');
    document.getElementById('dtDate').textContent = formatDate(selectedDate);
    document.getElementById('dtTime').textContent = selectedTime;
  } else {
    dt.classList.add('hidden');
  }
}

window.goToForm = function() {
  if (selectedTime) showStep('form');
};

window.goToSelect = function() {
  selectedTime = null;
  showStep('select');
  renderTimeSlots();
};

// ===== Booking Form Submit =====
document.getElementById('bookingForm').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!typeSelect.value) {
    selectTrigger.style.borderColor = '#ef4444';
    return;
  }
  selectTrigger.style.borderColor = '';

  const [h, m] = selectedTime.split(':').map(Number);
  const endH = m === 30 ? h + 1 : h;
  const endM = m === 30 ? '00' : '30';
  const timeRange = `${selectedTime}~${String(endH).padStart(2, '0')}:${endM}`;

  const bookingData = {
    date: selectedDate ? formatDateStr(selectedDate) : null,
    time: timeRange,
    title: document.getElementById('typeSelect').value,
    memo: document.getElementById('memoInput').value.trim(),
    name: userName,
  };

  const submitBtn = document.querySelector('.booking-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = '저장 중...';

  addReservation(bookingData);

  submitBtn.disabled = false;
  submitBtn.textContent = '예약하기';
  showStep('success');
});

// ===== Custom Select =====
const selectTrigger = document.getElementById('selectTrigger');
const selectOptions = document.getElementById('selectOptions');
const selectLabel = document.getElementById('selectLabel');
const typeSelect = document.getElementById('typeSelect');

selectTrigger.addEventListener('click', () => {
  selectOptions.classList.toggle('hidden');
});

selectOptions.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', () => {
    selectOptions.querySelectorAll('li').forEach(el => el.classList.remove('active'));
    li.classList.add('active');
    selectLabel.textContent = li.dataset.value;
    selectTrigger.classList.add('selected');
    typeSelect.value = li.dataset.value;
    selectOptions.classList.add('hidden');
  });
});

// ===== Menu =====
window.toggleMenu = function() {
  document.getElementById('menuDropdown').classList.toggle('hidden');
};

window.closeMenu = function() {
  document.getElementById('menuDropdown').classList.add('hidden');
};

// ===== 외부 클릭 시 드롭다운 닫기 =====
document.addEventListener('click', (e) => {
  if (!document.getElementById('customSelect').contains(e.target)) {
    selectOptions.classList.add('hidden');
  }
  const wrapper = document.querySelector('.menu-wrapper');
  if (wrapper && !wrapper.contains(e.target)) closeMenu();
});

// ===== Init =====
showPage('intro');
