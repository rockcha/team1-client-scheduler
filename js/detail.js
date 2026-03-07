import { getReservations, updateReservation } from "./storage.js";

const $scheduleList = document.getElementById("schedule-list");
const $searchInput = document.getElementById("search-input");
const $sortSelect = document.getElementById("sort-select");
const $summaryCount = document.getElementById("summary-count");

const $reservationForm = document.getElementById("reservation-form");
const $editId = document.getElementById("edit-id");
const $editTitle = document.getElementById("edit-title");
const $editType = document.getElementById("edit-type");
const $editDate = document.getElementById("edit-date");
const $editTime = document.getElementById("edit-time");
const $editName = document.getElementById("edit-name");

const modalElement = document.getElementById("reservationModal");
const reservationModal = new bootstrap.Modal(modalElement);

let reservations = [];
let filteredReservations = [];

/* =========================
초기 실행
========================= */
init();

function init() {
  reservations = getReservations();
  applyFiltersAndRender();
  bindEvents();
}

/* =========================
이벤트 바인딩
========================= */
function bindEvents() {
  $searchInput.addEventListener("input", applyFiltersAndRender);
  $sortSelect.addEventListener("change", applyFiltersAndRender);

  $scheduleList.addEventListener("click", (e) => {
    const item = e.target.closest(".schedule-item");
    if (!item) return;

    const id = Number(item.dataset.id);
    openEditModal(id);
  });

  $reservationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = Number($editId.value);

    const updatedData = {
      title: $editTitle.value.trim(),
      type: $editType.value.trim(),
      date: $editDate.value,
      time: $editTime.value.trim(),
      name: $editName.value.trim(),
    };

    if (
      !updatedData.title ||
      !updatedData.type ||
      !updatedData.date ||
      !updatedData.time ||
      !updatedData.name
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    updateReservation(id, updatedData);

    reservations = getReservations();
    applyFiltersAndRender();
    reservationModal.hide();
  });
}

/* =========================
검색 + 정렬 + 렌더
========================= */
function applyFiltersAndRender() {
  const keyword = $searchInput.value.trim().toLowerCase();
  const sortValue = $sortSelect.value;

  filteredReservations = [...reservations]
    .filter((item) => matchesKeyword(item, keyword))
    .sort((a, b) => sortReservations(a, b, sortValue));

  renderList(filteredReservations);
  renderCount(filteredReservations.length);
}

/* =========================
검색 조건
========================= */
function matchesKeyword(item, keyword) {
  if (!keyword) return true;

  const targetText = `${item.title} ${item.type} ${item.name}`.toLowerCase();
  return targetText.includes(keyword);
}

/* =========================
정렬
최신순: date/time 기준 내림차순
오래된순: date/time 기준 오름차순
========================= */
function sortReservations(a, b, sortValue) {
  const aTime = toSortableValue(a);
  const bTime = toSortableValue(b);

  if (sortValue === "oldest") {
    return aTime - bTime;
  }

  return bTime - aTime;
}

/* =========================
날짜 + 시간 문자열을 정렬용 숫자로 변환
예: 2026-03-10 + 09:00~10:00
=> 202603100900
========================= */
function toSortableValue(item) {
  const dateText = item.date ? item.date.replaceAll("-", "") : "00000000";
  const startTime = extractStartTime(item.time);
  const timeText = startTime.replace(":", "");

  return Number(`${dateText}${timeText}`);
}

/* =========================
time: "09:00~10:00" 에서 시작시간만 추출
========================= */
function extractStartTime(timeRange = "") {
  const [start = "00:00"] = timeRange.split("~");
  return start.trim() || "00:00";
}

/* =========================
리스트 렌더
========================= */
function renderList(list) {
  if (!list.length) {
    $scheduleList.innerHTML = `
      <div class="empty-box">
        <i class="fa-regular fa-calendar-xmark"></i>
        <h3 class="mb-2">예약 내역이 없습니다</h3>
        <p class="mb-0">검색 조건에 맞는 예약을 찾지 못했어요.</p>
      </div>
    `;
    return;
  }

  $scheduleList.innerHTML = list
    .map(
      (item) => `
        <article class="schedule-item" data-id="${item.id}">
          <div class="schedule-inner">
            <div class="schedule-left">
              <div class="time-badge">
                <i class="fa-regular fa-clock"></i>
                ${escapeHtml(item.time || "-")}
              </div>

              <div class="schedule-main">
                <h3 class="schedule-title">${escapeHtml(item.title || "제목 없음")}</h3>
                <div class="schedule-meta">
                  <span>
                    <i class="fa-regular fa-calendar"></i>
                    ${escapeHtml(item.date || "-")}
                  </span>
                  <span>
                    <i class="fa-regular fa-user"></i>
                    ${escapeHtml(item.name || "-")}
                  </span>
                </div>
              </div>
            </div>

            <div class="schedule-right">
              <span class="type-badge">
                <i class="fa-regular fa-folder-open"></i>
                ${escapeHtml(item.type || "-")}
              </span>
              <span class="edit-hint">
                <i class="fa-solid fa-chevron-right"></i>
              </span>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

/* =========================
건수 표시
========================= */
function renderCount(count) {
  $summaryCount.textContent = `총 ${count}건`;
}

/* =========================
모달 열기
========================= */
function openEditModal(id) {
  const target = reservations.find((item) => item.id === id);
  if (!target) return;

  $editId.value = target.id;
  $editTitle.value = target.title ?? "";
  $editType.value = target.type ?? "";
  $editDate.value = target.date ?? "";
  $editTime.value = target.time ?? "";
  $editName.value = target.name ?? "";

  reservationModal.show();
}

/* =========================
XSS 방지용 최소 escape
========================= */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
