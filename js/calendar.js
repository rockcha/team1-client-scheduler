import { getReservations } from "./storage.js";

const $year = document.querySelector("#year");
const $month = document.querySelector("#month");
const $prev = document.querySelector("#prev");
const $next = document.querySelector("#next");
const $calendar = document.querySelector("#calendar");

const API_URL =
  "https://calendarific.com/api/v2/holidays?api_key=EZ9RGnS3FTpTkh9tMsd5qRMRW2QWvv82";
const COUNTRY = "kr";

let state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  holidays: [],
};

// 공휴일 가져오기
async function getHolidays(year) {
  try {
    const response = await fetch(`${API_URL}&country=${COUNTRY}&year=${year}`);
    const data = await response.json();
    return data.response.holidays.map((h) => h.date.iso);
  } catch (err) {
    console.error("공휴일 조회 실패:", err);
    return [];
  }
}

// 달력 헤더 렌더
function renderCalendarHeader(year, month) {
  $year.innerHTML = `${year}년`;
  $month.innerHTML = `${month + 1}월 상담일정`;
}

// 달력 렌더
async function renderCalendar(year, month) {
  renderCalendarHeader(year, month);

  state.holidays = await getHolidays(year);

  const reservations = getReservations();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const weekday = ["일", "월", "화", "수", "목", "금", "토"];

  let html = "";

  // 요일
  for (let i = 0; i < weekday.length; i++) {
    html += `<div class="date weekday">${weekday[i]}</div>`;
  }

  // 빈칸
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="date empty"></div>`;
  }

  // 날짜
  for (let day = 1; day <= lastDate; day++) {
    const dayIndex = (firstDay + day - 1) % 7;

    const paddedMonth = String(month + 1).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");
    const fullDate = `${year}-${paddedMonth}-${paddedDay}`;

    const isSunday = dayIndex === 0;
    const isSaturday = dayIndex === 6;
    const isHoliday = state.holidays.includes(fullDate);

    const isBlocked = isSunday || isSaturday || isHoliday;

    let className = "date day";
    if (isSunday) className += " sunday";
    if (isSaturday) className += " saturday";
    if (isHoliday) className += " holiday";
    if (isBlocked) className += " blocked";

    // 예약 리스트
    const dayReservations = reservations.filter((r) => r.date === fullDate);
    let reservationHTML = "";
    dayReservations.forEach((r) => {
      reservationHTML += `<div class="reservation-item">${r.time} ${r.name}</div>`;
    });

    html += `
      <div 
        class="${className}" 
        data-day="${fullDate}" 
        ${isBlocked ? "data-blocked='true'" : ""}
        ${dayReservations.length ? `data-reservation-count="${dayReservations.length}"` : ""}
      >
        <div class="day-number">${day}</div>
        <div class="reservation-list">
          ${reservationHTML}
        </div>
      </div>
    `;
  }

  $calendar.innerHTML = html;
}

// 날짜 클릭
$calendar.addEventListener("click", (e) => {
  const target = e.target.closest(".day");
  if (!target) return;

  if (target.dataset.blocked === "true") {
    alert("예약 불가능한 날짜입니다.");
    return;
  }

  const selectedDate = target.dataset.day;
  location.href = `detail.html?date=${selectedDate}`;
});

// 이전 다음
$prev.addEventListener("click", () => {
  state.month--;
  if (state.month < 0) {
    state.month = 11;
    state.year--;
  }
  renderCalendar(state.year, state.month);
});

$next.addEventListener("click", () => {
  state.month++;
  if (state.month > 11) {
    state.month = 0;
    state.year++;
  }
  renderCalendar(state.year, state.month);
});

// 최초 실행
renderCalendar(state.year, state.month);
