const RES = [
  {id:"1", room:"video",   date:null, startTime:"09:30", endTime:"12:00", eventName:"청년 농식품 창업교육 3회차", manager:"홍길동", attendees:62, purpose:"창업 실무 교육", status:"approved", rejectReason:"", processedBy:"dksemffl90@gmail.com", processedAt:"2026-09-01T09:00:00Z", agreed:true, signedName:"홍길동", signedAt:"2026-09-05T04:12:00Z", agreementVersion:"2026-09-01 v1"},
  {id:"2", room:"seminar", date:null, startTime:"10:00", endTime:"11:30", eventName:"가공기술 자문회의", manager:"김영희", attendees:12, purpose:"애로기술 자문", status:"pending", rejectReason:""},
  {id:"3", room:"seminar", date:null, startTime:"14:00", endTime:"16:30", eventName:"로컬벤처 대학 평가회", manager:"박철수", attendees:28, purpose:"최종평가 심사", status:"approved", rejectReason:"", processedBy:"dksemffl90@gmail.com", processedAt:"2026-09-02T10:00:00Z"},
  {id:"4", room:"video",   date:null, startTime:"14:00", endTime:"17:30", eventName:"시제품 시식 평가회", manager:"이수민", attendees:75, purpose:"시제품 관능평가", status:"pending", rejectReason:""},
  {id:"5", room:"video",   date:null, startTime:"13:00", endTime:"15:00", eventName:"취소된 워크숍", manager:"최민수", attendees:40, purpose:"내부 워크숍", status:"rejected", rejectReason:"일정 중복", processedBy:"dksemffl90@gmail.com", processedAt:"2026-09-03T10:00:00Z"},
];
function d(off){const x=new Date();x.setDate(x.getDate()+off);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;}
RES[0].date=d(0); RES[1].date=d(0); RES[2].date=d(0); RES[3].date=d(1); RES[4].date=d(2);
export function initializeApp(){return {};}
export function getFirestore(){return {};}
export function collection(){return {};}
export function addDoc(){return Promise.resolve({id:"x"});}
export function doc(){return {};}
export function updateDoc(){return Promise.resolve();}
export function deleteDoc(){return Promise.resolve();}
export function query(){return {};}
export function orderBy(){return {};}
export function serverTimestamp(){return null;}
export function getDoc(){return Promise.resolve({exists:()=>true});}
export function runTransaction(){return Promise.resolve();}
export function onSnapshot(q, cb){ setTimeout(()=>cb({docs:RES.map(r=>({id:r.id,data:()=>r}))}),0); }
export function getAuth(){return {};}
export function GoogleAuthProvider(){}
export function signInWithPopup(){return Promise.resolve();}
export function signOut(){return Promise.resolve();}
export function onAuthStateChanged(a, cb){ setTimeout(()=>cb(window.__MOCK_ADMIN ? {email:"dksemffl90@gmail.com"} : null),0); }
