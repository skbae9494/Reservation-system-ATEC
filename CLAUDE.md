# ATEC교육장 예약시스템

경상남도농업기술원 ATEC교육장 실시간 예약시스템. **파일은 `index.html` 하나뿐이며, 이 단일 파일 구조를 유지한다.**

기존에 운영 중인 경남치유농업센터 교육장 예약시스템(`https://github.com/Gyeongnam-ares/Reservation-system-AHD`)을 복제해 ATEC용으로 개편한 것이다. 화면 구성·색상·동작 방식은 원본과 동일하게 유지하는 것이 원칙이다.

---

## 1. 기술 구성

- 프런트엔드: 단일 `index.html` (외부 빌드 도구 없음, 프레임워크 없음)
- 스타일: `<style>` 인라인. Noto Serif KR / Noto Sans KR (Google Fonts)
- 백엔드: Firebase — Firestore(실시간 구독) + Google Authentication
- 배포: GitHub Pages (정적 호스팅)

### 작업 규칙

- **파일을 분리하지 않는다.** CSS·JS를 별도 파일로 빼지 말 것. GitHub Pages에 index.html 하나만 올려 운영한다.
- **외부 라이브러리를 추가하지 않는다.** Firebase SDK(모듈 CDN) 외에는 순수 JS로 작성한다.
- **모든 UI 문구는 한국어**이며, 관공서 안내문 톤을 유지한다.
- 사용자 입력이 화면에 들어가는 모든 지점에 `escapeHtml()`을 반드시 적용한다.
- 날짜는 절대 `toISOString()`으로 만들지 않는다. UTC 변환 때문에 한국(UTC+9)에서 하루가 밀린다. 반드시 `toDateStr()` / `todayStr()`를 쓴다. (원본 시스템에서 실제로 발생했던 버그다.)
- 예상 밖의 `status` 값이 들어와도 화면 전체가 멈추지 않도록 `statusMeta()` 안전장치가 있다. 같은 방식으로 방어적으로 작성한다.

---

## 2. 교육장 정의

코드 상단 `ROOMS` 배열 한 곳에서 관리한다. 여기만 고치면 신청폼·시간표·관리자 필터·CSV가 모두 따라간다.

```js
const ROOMS = [
  { id: "video",   name: "ATEC 영상교육장", capacity: 80 },
  { id: "seminar", name: "ATEC 세미나실",   capacity: 30 },
];
```

- **`id`는 Firestore에 저장되는 식별자다. 운영 시작 후에는 절대 바꾸지 않는다.** 바꾸면 기존 예약이 어느 교육장 건인지 알 수 없게 된다. 표시 이름(`name`) 변경은 언제든 안전하다.
- 교육장을 추가할 때는 배열에 항목만 추가하면 된다. 다만 시간표가 열 단위로 늘어나므로 4개를 넘어가면 좁은 화면 레이아웃을 다시 봐야 한다.
- `roomIdOf(r)` — 저장된 값이 없거나 알 수 없으면 첫 번째 교육장으로 처리하는 안전장치. 직접 `r.room`을 읽지 말고 이 함수를 쓴다.

---

## 3. 사용 주의사항 동의(동의서) 기능

「예약 신청하기」 → 입력 검증 통과 → **동의 팝업** → 체크 후 「동의하고 예약 신청」 → 저장.

설정은 코드 상단 세 값뿐이다.

```js
const AGREEMENT_TITLE   = "ATEC교육장 사용 주의사항";
const AGREEMENT_VERSION = "";   // 예: "2026-09-01 v1"
const AGREEMENT_ITEMS   = [];   // 주의사항 문장 배열
```

- `AGREEMENT_ITEMS`가 비어 있으면 팝업에 "문구가 아직 등록되지 않았습니다" 안내가 뜨고, 동의 절차 자체는 정상 진행된다. **현재 문구는 담당자가 직접 채워 넣을 예정이라 비워 둔 상태다. 임의로 문구를 만들어 채우지 말 것.**
- **문구를 수정할 때는 `AGREEMENT_VERSION`도 반드시 함께 올린다.** 버전은 예약 건마다 저장되므로, 버전을 그대로 두고 문구만 바꾸면 "누가 무엇에 동의했는지"를 기록상 구분할 수 없게 된다.
- 서명은 신청자가 입력한 담당자명을 자동으로 기입하는 방식이다. 별도 입력란이 아니다.
- 동의 당시의 문구 원문(`agreementItems`)도 예약 문서에 함께 저장한다. 나중에 문구를 바꿔도 과거 동의 내용이 보존된다.
- 취소 / ESC / 배경 클릭으로 팝업을 닫으면 저장되지 않고, 폼 입력값은 그대로 남는다.

---

## 4. Firestore 데이터 구조

### `reservations/{자동ID}`

| 필드 | 타입 | 설명 |
|---|---|---|
| `room` | string | 교육장 id (`video` / `seminar`) |
| `date` | string | `YYYY-MM-DD` |
| `startTime` / `endTime` | string | `HH:MM` (30분 단위) |
| `eventName` | string | 행사명 (최대 60자) |
| `manager` | string | 담당자명 (2~20자) |
| `attendees` | number | 인원 (교육장 정원 이내) |
| `purpose` | string | 사용 목적 (최대 300자) |
| `status` | string | `pending` / `approved` / `rejected` |
| `rejectReason` | string | 거절 사유 |
| `processedBy` / `processedAt` | string | 승인·거절 처리자 이메일 / ISO 시각 |
| `agreed` | boolean | 주의사항 동의 여부 |
| `signedName` | string | 서명자명 (= 신청 당시 `manager`) |
| `signedAt` | string | 동의 시각 (ISO) |
| `agreementVersion` | string | 동의 당시 문구 버전 |
| `agreementItems` | array\<string\> | 동의 당시 문구 원문 |
| `createdAt` | timestamp | `serverTimestamp()` |

### `admins/{이메일}`

문서 ID가 담당자 이메일. 문서가 존재하면 담당자 권한을 가진다. 내용은 비워도 된다.
Firebase 콘솔에서 직접 추가한다.

---

## 5. 업무 규칙 (변경 시 주의)

- **당일 신청 불가.** 최소 하루 전까지만 신청할 수 있다.
- **주말·공휴일 휴관.** 공휴일은 `HOLIDAYS` 집합에 2026~2027년치가 하드코딩되어 있다. **2028년 이후분은 매년 직접 갱신해야 한다.**
- **운영시간 평일 09:00~18:00, 30분 단위.**
- **중복 검사는 같은 교육장 안에서만 한다.** 영상교육장 14시와 세미나실 14시는 동시에 신청 가능하다. 승인 처리 시 검사도 같은 기준이다.
- **신청자 본인 취소 기능은 의도적으로 넣지 않았다.** 원본 시스템에서 내린 결정이며, 취소는 담당자가 처리한다. 요청 없이 추가하지 말 것.
- 담당자 승인은 Firestore 트랜잭션으로 처리한다. 여러 담당자가 동시에 같은 건을 처리하는 상황에 대비한 것이므로 단순 `updateDoc`으로 되돌리지 말 것.

---

## 6. 남은 작업

1. **Firebase 프로젝트 연결** — `index.html`의 `firebaseConfig`가 `PASTE_...` 자리표시자 상태다. 치유농업센터용 `reservation-ahd`와는 **별도 프로젝트**를 새로 만들어야 데이터와 담당자 권한이 분리된다.
2. **사용 주의사항 문구 작성** — 담당자가 직접 작성 예정. `AGREEMENT_ITEMS`와 `AGREEMENT_VERSION`을 함께 채운다.
3. **ATEC 영상교육장 / 세미나실 운영시간 확인** — 현재는 두 곳 모두 평일 09:00~18:00으로 가정하고 있다. 교육장별로 다르면 `ROOMS`에 시간 필드를 추가하는 구조 변경이 필요하다.
4. **Firestore 보안규칙 적용** — `firestore.rules` 초안 참고.
5. **GitHub Pages 배포** — 저장소 생성 후 Settings > Pages에서 배포. Firebase 콘솔의 Authentication > Settings > 승인된 도메인에 `<계정>.github.io`를 추가해야 구글 로그인이 동작한다.

---

## 7. 로컬 미리보기 (Firebase 없이)

`_preview/fbstub.js`가 Firebase SDK를 흉내 내는 스텁이다. 설정 없이 화면과 로직을 확인할 수 있다.

```bash
mkdir -p _preview
python3 - <<'PY'
import io, re
s = io.open('index.html', encoding='utf-8').read()
s = re.sub(r'https://www\.gstatic\.com/firebasejs/10\.12\.2/firebase-(app|firestore|auth)\.js',
           './fbstub.js', s)
s = s.replace('<body>', '<body>\n<script>window.__MOCK_ADMIN = new URLSearchParams(location.search).has("admin");</script>')
io.open('_preview/preview.html', 'w', encoding='utf-8').write(s)
PY
cd _preview && python3 -m http.server 8899
```

- 신청자 화면: `http://localhost:8899/preview.html`
- 담당자 화면: `http://localhost:8899/preview.html?admin=1` (로그인 통과 상태로 뜬다)

`_preview/`는 확인용이므로 배포 대상이 아니다. 저장소에 올리지 않으려면 `.gitignore`에 추가한다.

**UI나 로직을 고친 뒤에는 이 미리보기로 실제 렌더링과 콘솔 오류를 확인한 다음 마무리한다.**
