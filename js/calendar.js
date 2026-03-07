const $year = document.querySelector("#year");
const $month = document.querySelector("#month");
const $prev = document.querySelector("#prev");
const $next = document.querySelector("#next");
const $calendar = document.querySelector("#calendar");

const API_URL =
  "https://calendarific.com/api/v2/holidays?api_key=EZ9RGnS3FTpTkh9tMsd5qRMRW2QWvv82";
const COUNTRY = "kr";

// 상태관리 객체
let state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  holidays: [],
};
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

function renderCalendarHeader(year, month) {
  $year.innerHTML = `${year}년`;
  $month.innerHTML = `${month + 1}월 상담일정`;
}

async function renderCalendar(year, month) {
  renderCalendarHeader(year, month);

  state.holidays = await getHolidays(year);

  const firstDay = new Date(year, month, 1).getDay(); // 이번달 한국시각 첫째일자
  const lastDate = new Date(year, month + 1, 0).getDate(); // 이번달 마지막 일자
  const weekday = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  let html = "";
  // 요일 출력
  for (let i = 0; i < weekday.length; i++) {
    if (i === 0) {
      html += `<div class="date weekday sunday">${weekday[i]}</div>`;
    } else if (i === 6) {
      html += `<div class="date weekday saturday">${weekday[i]}</div>`;
    } else {
      html += `<div class="date weekday">${weekday[i]}</div>`;
    }
  }
  // 빈 일자 출력
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="date empty"></div>`;
  }
  // 일자 출력
  for (let day = 1; day <= lastDate; day++) {
    const dayIndex = (firstDay + day - 1) % 7;

    const paddedMonth = String(month + 1).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");
    const fullDate = `${year}-${paddedMonth}-${paddedDay}`;
    console.log(fullDate);
    const isSunday = dayIndex === 0;
    const isSaturday = dayIndex === 6;
    const isHoliday = state.holidays.includes(fullDate);

    const isBlocked = isSunday || isSaturday || isHoliday;

    let className = "date day";
    if (isSunday) className += " sunday";
    if (isSaturday) className += " saturday";
    if (isHoliday) className += " holiday";
    if (isBlocked) className += " blocked";

    html += `
      <div 
        class="${className}" 
        data-day="${fullDate}" 
        ${isBlocked ? "data-blocked='true'" : ""}
      >
        ${day}
      </div>
    `;
  }

  $calendar.innerHTML = html;
}

$calendar.addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("day")) return;
  if (target.dataset.blocked === "true") {
    alert("예약 불가능한 날짜입니다.");
    return;
  }

  const selectedDate = target.dataset.day;

  // reserve 페이지로 이동
  location.href = `reserve.html?date=${selectedDate}`;
  // joy님이 이 클릭 날짜를 받아야해요.
  // 이걸 스케쥴(이름은 하고싶은거) 객체로 동적으로 받아서.. 로컬스토리지에 예약될 때나... 수정할 때.. 삭제할 때로 로컬스토리지에 저장해야함.
  // 그래서 이걸 우리가 받아와서 정록님과 제가 ui에 반영할 수 있을거 같습니다.
});
// 이전 달 버튼
$prev.addEventListener("click", () => {
  state.month--;
  if (state.month < 0) {
    state.month = 11;
    state.year--;
  }
  renderCalendar(state.year, state.month);
});
// 다음 달 버튼
$next.addEventListener("click", () => {
  state.month++;
  if (state.month > 11) {
    state.month = 0;
    state.year++;
  }
  renderCalendar(state.year, state.month);
});

renderCalendar(state.year, state.month);
