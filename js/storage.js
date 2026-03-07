// 로컬 스토리지 키
const LS_KEY = "reservations";

// 객체 예시
// { id: 1,
// 	 date: "2026-03-10",
// 	 time: "09:00~10:00",
// 	 title: "진로 상담",
// 	 type: "진로 상담",
// 	 name: "홍길동“
// 	},

/* =========================
예약 전체 가져오기
========================= */
export function getReservations() {
  const data = localStorage.getItem(LS_KEY);
  return data ? JSON.parse(data) : [];
}

/* =========================
예약 추가
========================= */
export function addReservation(reservation) {
  const reservations = getReservations();

  const newReservation = {
    id: Date.now(), // 간단한 id 생성
    ...reservation,
  };

  reservations.push(newReservation);

  localStorage.setItem(LS_KEY, JSON.stringify(reservations));

  return newReservation;
}

/* =========================
예약 삭제 (id)
========================= */
export function deleteReservation(id) {
  const reservations = getReservations();

  const filtered = reservations.filter((item) => item.id !== id);

  localStorage.setItem(LS_KEY, JSON.stringify(filtered));
}

/* =========================
예약 수정 (id + 새 데이터)
========================= */
export function updateReservation(id, newData) {
  const reservations = getReservations();

  const updated = reservations.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...newData,
      };
    }
    return item;
  });

  localStorage.setItem(LS_KEY, JSON.stringify(updated));
}

// 필요한 모듈 API 더 있으면 말씀해주세요!
// 예) 시간 순 정렬해서 배열로 리턴하는 함수
