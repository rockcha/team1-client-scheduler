import { getReservations } from "./storage.js"; 

const reservations = getReservations();
console.log(reservations);










const today = new Date().toISOString().split("T")[0]
const month = today.slice(0,7)


// 예약 건수
const todayReservation = reservations.filter(tr => tr.date === today)
const monthReservation = reservations.filter(mr=>mr.date.slice(0,7) === month)
const recentReservation = reservations.slice(-5).reverse()
const totalReservation = reservations.length

console.log(today,month)


//예약건수 텍스트 넣기
const todayReservationContent = document.getElementById('today-reservation')
const monthReservationContent = document.getElementById('month-reservation')
const recentReservationContent = document.getElementById('recent-reservation')
const totalReservationContent = document.getElementById('total-reservation')

todayReservationContent.textContent = `${todayReservation.length} 건`
monthReservationContent.textContent = `${monthReservation.length} 건`
recentReservationContent.textContent = `${recentReservation.length} 건`
totalReservationContent.textContent = `${totalReservation} 건`


//오늘 예약자 리스트

const todayList = document.getElementById('todayScheduleList')
todayList.innerHTML = "";

if(todayReservation.length === 0){
    const li = document.createElement("li");
    li.textContent = "오늘 일정이 없습니다."
    todayList.appendChild(li);
}else{
    todayReservation.forEach((today)=>{
        const li = document.createElement("li");
        li.textContent = `${today.time} - ${today.name} (${today.title})`
        todayList.appendChild(li);
    }
      
    )
}

// 최신 예약 리스트
const recentList = document.getElementById("recentList");
recentList.innerHTML = "";
recentReservation.forEach(r => {
  const li = document.createElement("li");
  li.textContent = `${r.date} ${r.time} - ${r.name} (${r.title})`;
  recentList.appendChild(li);
});



//통계

const typeCount = { 
  "심리 상담":0, 
  "진로 상담":0, 
  "학습 상담":0, 
  "기타 상담":0
};

reservations.forEach(r => { 
  if(typeCount[r.title] !== undefined) typeCount[r.title]++; 
});

const ctx = document.getElementById("reservationChart");
if(ctx){
  new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(typeCount),
      datasets: [{
        label: "상담 유형별 예약 수",
        data: Object.values(typeCount),
        backgroundColor: ["#6C8EF5","#F4A261","#2A9D8F", "#E76F51"]
      }]
    },
    options: { responsive:true, plugins:{ legend:{ display:false } } }
  });
}

// 사이드바
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});